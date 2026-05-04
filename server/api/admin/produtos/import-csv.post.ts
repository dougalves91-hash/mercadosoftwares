import { createError, defineEventHandler, readMultipartFormData } from 'h3'
import prisma from '../../../db/prisma'
import { requireAdminSession } from '../../../utils/adminSession'

const MAX_ERROR_COUNT = 100

function toSlug(input: unknown): string {
  return String(input ?? '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function normalizeImageUrl(input: unknown): string | null {
  const raw = String(input ?? '').trim()
  if (!raw) return null

  if (raw.startsWith('http://')) return raw.replace(/^http:\/\//, 'https://')
  if (raw.startsWith('https://')) return raw
  if (raw.startsWith('//')) return `https:${raw}`
  if (raw.startsWith('/')) return raw

  if (/^([a-z0-9-]+\.)+[a-z]{2,}(\/|$)/i.test(raw)) {
    return `https://${raw}`
  }

  return raw
}

function parseNumber(input: unknown): number | null {
  const raw = String(input ?? '').trim()
  if (!raw) return null

  const cleaned = raw
    .replace(/\s/g, '')
    .replace(/[^0-9,.-]/g, '')

  const decimalComma = cleaned.includes(',') && (!cleaned.includes('.') || cleaned.lastIndexOf(',') > cleaned.lastIndexOf('.'))
  const normalized = decimalComma
    ? cleaned.replace(/\./g, '').replace(',', '.')
    : cleaned.replace(/,/g, '')

  const value = Number(normalized)
  return Number.isFinite(value) ? value : null
}

function parseBoolean(input: unknown, fallback: boolean): boolean {
  const raw = String(input ?? '').trim().toLowerCase()
  if (!raw) return fallback
  if (['true', '1', 'yes', 'y', 'sim', 's', 'ativo', 'active'].includes(raw)) return true
  if (['false', '0', 'no', 'n', 'nao', 'não', 'inativo', 'inactive'].includes(raw)) return false
  return fallback
}

function detectDelimiter(text: string): string {
  const firstLine = text.split(/\r?\n/, 1)[0] || ''
  const commaCount = (firstLine.match(/,/g) || []).length
  const semicolonCount = (firstLine.match(/;/g) || []).length
  return semicolonCount > commaCount ? ';' : ','
}

function parseCsv(text: string): Record<string, string>[] {
  const rows: string[][] = []
  let row: string[] = []
  let cell = ''
  let inQuotes = false
  const delimiter = detectDelimiter(text)

  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    const next = text[i + 1]

    if (char === '"') {
      if (inQuotes && next === '"') {
        cell += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
      continue
    }

    if (char === delimiter && !inQuotes) {
      row.push(cell)
      cell = ''
      continue
    }

    if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && next === '\n') i++
      row.push(cell)
      if (row.some((value) => value.trim() !== '')) rows.push(row)
      row = []
      cell = ''
      continue
    }

    cell += char
  }

  row.push(cell)
  if (row.some((value) => value.trim() !== '')) rows.push(row)

  const headers = (rows.shift() || []).map((header) => header.trim())
  if (!headers.length) return []

  return rows.map((values) => {
    const item: Record<string, string> = {}
    headers.forEach((header, index) => {
      item[header] = String(values[index] ?? '').trim()
    })
    return item
  })
}

function splitCategories(row: Record<string, string>): string[] {
  const rawValues = [row.category, row.categories]
    .map((value) => String(value ?? '').trim())
    .filter(Boolean)

  return rawValues
    .flatMap((value) => value.split(/[|;]/g))
    .map((value) => value.trim())
    .filter(Boolean)
}

async function ensureCategories(names: string[]) {
  const ids: string[] = []
  let created = 0

  for (const name of names) {
    const slug = toSlug(name)
    if (!slug) continue

    const existing = await prisma.categoria.findUnique({ where: { slug }, select: { id: true } })
    if (existing) {
      ids.push(existing.id)
      continue
    }

    const category = await prisma.categoria.create({
      data: { nome: name, slug, ativo: true },
      select: { id: true }
    })
    ids.push(category.id)
    created++
  }

  return { ids: [...new Set(ids)], created }
}

export default defineEventHandler(async (event) => {
  requireAdminSession(event)

  const form = await readMultipartFormData(event)
  const file = form?.find((part) => part.name === 'file' && part.data)

  if (!file?.data) {
    throw createError({ statusCode: 400, statusMessage: 'Arquivo CSV é obrigatório' })
  }

  const text = file.data.toString('utf8').replace(/^\uFEFF/, '')
  const rows = parseCsv(text)

  if (!rows.length) {
    throw createError({ statusCode: 400, statusMessage: 'CSV vazio ou sem linhas válidas' })
  }

  let createdProducts = 0
  let updatedProducts = 0
  let createdCategories = 0
  const errors: string[] = []

  for (let index = 0; index < rows.length; index++) {
    const row = rows[index]
    const line = index + 2

    try {
      const name = String(row.name ?? '').trim()
      const slug = toSlug(row.slug)

      if (!slug) throw new Error('slug obrigatório')
      if (!name) throw new Error('name obrigatório')

      const price = parseNumber(row.price)
      if (price === null) throw new Error('price inválido')

      const compareAtPrice = parseNumber(row.compareAtPrice)
      const image = normalizeImageUrl(row.image)
      const categoryResult = await ensureCategories(splitCategories(row))
      createdCategories += categoryResult.created

      const existing = await prisma.produto.findUnique({ where: { slug }, select: { id: true } })
      const productData = {
        nome: name,
        slug,
        descricao: String(row.description ?? '').trim() || null,
        preco: price,
        precoAntigo: compareAtPrice,
        imagem: image,
        ativo: parseBoolean(row.active, true),
        cardItems: String(row.shortDescription ?? '').trim() || null,
        googleAdsConversionLabel: String(row.googleAdsConversionLabel ?? '').trim() || null
      }
      const createCategoriesData = categoryResult.ids.length
        ? {
            produtoCategorias: {
              create: categoryResult.ids.map((id) => ({
                categoria: { connect: { id } }
              }))
            }
          }
        : {}
      const updateCategoriesData = {
        produtoCategorias: {
          deleteMany: {},
          ...(categoryResult.ids.length
            ? {
                create: categoryResult.ids.map((id) => ({
                  categoria: { connect: { id } }
                }))
              }
            : {})
        }
      }

      if (existing) {
        await prisma.produto.update({ where: { id: existing.id }, data: { ...productData, ...updateCategoriesData }, select: { id: true } })
        updatedProducts++
      } else {
        await prisma.produto.create({ data: { ...productData, ...createCategoriesData }, select: { id: true } })
        createdProducts++
      }
    } catch (err: any) {
      if (errors.length < MAX_ERROR_COUNT) {
        errors.push(`Linha ${line}: ${err?.message || 'erro desconhecido'}`)
      }
    }
  }

  return {
    ok: true,
    processedRows: rows.length,
    createdProducts,
    updatedProducts,
    createdCategories,
    produtosCriados: createdProducts,
    produtosAtualizados: updatedProducts,
    categoriasCriadas: createdCategories,
    erros: errors,
    errors
  }
})
