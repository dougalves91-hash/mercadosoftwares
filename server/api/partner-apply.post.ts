import { defineEventHandler, readBody, createError } from 'h3'
import prisma from '#root/server/db/prisma'

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

export default defineEventHandler(async (event) => {
  const body = await readBody(event)

  const name = String(body?.name || '').trim()
  const email = String(body?.email || '').trim().toLowerCase()
  const website = body?.website != null ? String(body.website).trim() : ''
  const social = body?.social != null ? String(body.social).trim() : ''
  const country = String(body?.country || '').trim()
  const monthlyTraffic = body?.monthlyTraffic != null ? String(body.monthlyTraffic).trim() : ''
  const promotionPlan = body?.promotionPlan != null ? String(body.promotionPlan).trim() : ''

  if (!name) throw createError({ statusCode: 400, statusMessage: 'Name is required' })
  if (!email) throw createError({ statusCode: 400, statusMessage: 'Email is required' })
  if (!isValidEmail(email)) throw createError({ statusCode: 400, statusMessage: 'Email is invalid' })
  if (!country) throw createError({ statusCode: 400, statusMessage: 'Country is required' })

  if (name.length > 120) throw createError({ statusCode: 400, statusMessage: 'Name is too long' })
  if (email.length > 255) throw createError({ statusCode: 400, statusMessage: 'Email is too long' })
  if (website.length > 255) throw createError({ statusCode: 400, statusMessage: 'Website is too long' })
  if (social.length > 255) throw createError({ statusCode: 400, statusMessage: 'Social is too long' })
  if (country.length > 80) throw createError({ statusCode: 400, statusMessage: 'Country is too long' })
  if (monthlyTraffic.length > 120) throw createError({ statusCode: 400, statusMessage: 'Monthly traffic is too long' })
  if (promotionPlan.length > 2000) throw createError({ statusCode: 400, statusMessage: 'Promotion plan is too long' })

  const prismaAny = prisma as any

  try {
    await prismaAny.partnerApplication.create({
      data: {
        name,
        email,
        website: website || null,
        social: social || null,
        country,
        monthlyTraffic: monthlyTraffic || null,
        promotionPlan: promotionPlan || null,
      },
      select: { id: true },
    })
  } catch {
    throw createError({ statusCode: 500, statusMessage: 'Could not submit application' })
  }

  return { ok: true }
})
