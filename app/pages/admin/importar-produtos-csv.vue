<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold">Importar Produtos CSV</h1>
        <p class="text-sm text-gray-600 mt-1">Importa produtos de um CSV exportado de outra loja Nuxt igual a esta.</p>
      </div>
    </div>

    <div class="bg-white rounded shadow p-6 space-y-4">
      <div>
        <label class="block text-sm font-medium mb-1">Arquivo CSV</label>
        <input type="file" accept=".csv,text/csv" class="w-full border p-2 rounded" :disabled="loading" @change="onFileChange" />
      </div>

      <div class="text-sm text-gray-600">
        Colunas aceitas: name, slug, description, shortDescription, price, compareAtPrice, image, gallery, category, categories, active, featured, stock, productType, deliveryInstructions, seoTitle, seoDescription, googleAdsConversionLabel.
      </div>

      <div class="flex items-center gap-3">
        <button
          class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          :disabled="loading || !file"
          @click="uploadCsv"
        >
          {{ loading ? 'Importando...' : 'Importar CSV' }}
        </button>
      </div>

      <div v-if="error" class="text-red-700 text-sm font-medium">{{ error }}</div>
      <div v-if="message" class="text-green-700 text-sm font-medium">{{ message }}</div>

      <div v-if="result" class="border rounded p-4">
        <h2 class="text-lg font-semibold mb-3">Resumo da importação</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
          <div class="font-mono">linhas processadas: {{ result.processedRows ?? '-' }}</div>
          <div class="font-mono">produtos criados: {{ result.createdProducts ?? 0 }}</div>
          <div class="font-mono">produtos atualizados: {{ result.updatedProducts ?? 0 }}</div>
          <div class="font-mono">categorias criadas: {{ result.createdCategories ?? 0 }}</div>
        </div>

        <div v-if="result.errors?.length" class="mt-4">
          <h3 class="font-semibold text-red-700 mb-2">Erros</h3>
          <ul class="list-disc pl-5 text-sm text-red-700 space-y-1">
            <li v-for="item in result.errors" :key="item">{{ item }}</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: 'admin' })

const file = ref<File | null>(null)
const loading = ref(false)
const error = ref('')
const message = ref('')
const result = ref<any>(null)

function onFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  file.value = input.files?.[0] || null
  error.value = ''
  message.value = ''
  result.value = null
}

async function uploadCsv() {
  if (!file.value) return

  loading.value = true
  error.value = ''
  message.value = ''
  result.value = null

  try {
    const formData = new FormData()
    formData.append('file', file.value)

    const res = await $fetch('/api/admin/produtos/import-csv', {
      method: 'POST',
      body: formData
    })

    result.value = res
    message.value = 'Importação concluída.'
  } catch (err: any) {
    error.value = err?.data?.statusMessage || 'Erro ao importar CSV'
  } finally {
    loading.value = false
  }
}
</script>
