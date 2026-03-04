<template>
  <div class="bg-white">
    <main>
      <section class="py-20">
        <div class="container mx-auto max-w-6xl px-4">
          <div class="mx-auto max-w-3xl text-center">
            <h1 class="text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl">Partner Application</h1>
            <p class="mt-6 text-lg leading-7 text-gray-600">
              Apply to join our partner program. We’ll review your details and get back to you by email.
            </p>
          </div>

          <div class="mx-auto mt-12 max-w-2xl">
            <div class="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-gray-200">
              <div v-if="submitted" class="text-center">
                <h2 class="text-2xl font-semibold tracking-tight text-gray-900">Application received</h2>
                <p class="mt-3 text-sm leading-6 text-gray-600">Thanks! We’ll contact you soon.</p>
                <div class="mt-8">
                  <NuxtLink
                    to="/en/become-a-partner"
                    class="inline-flex items-center justify-center rounded-xl bg-gray-900 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2"
                  >
                    Back to Partner Program
                  </NuxtLink>
                </div>
              </div>

              <form v-else class="space-y-6" @submit.prevent="onSubmit">
                <div class="grid gap-6 sm:grid-cols-2">
                  <div>
                    <label for="name" class="block text-sm font-medium text-gray-900">Name</label>
                    <input
                      id="name"
                      v-model="form.name"
                      type="text"
                      autocomplete="name"
                      maxlength="120"
                      class="mt-2 block w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/20"
                      required
                    />
                  </div>

                  <div>
                    <label for="email" class="block text-sm font-medium text-gray-900">Email</label>
                    <input
                      id="email"
                      v-model="form.email"
                      type="email"
                      autocomplete="email"
                      maxlength="255"
                      class="mt-2 block w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/20"
                      required
                    />
                  </div>
                </div>

                <div class="grid gap-6 sm:grid-cols-2">
                  <div>
                    <label for="website" class="block text-sm font-medium text-gray-900">Website</label>
                    <input
                      id="website"
                      v-model="form.website"
                      type="url"
                      inputmode="url"
                      maxlength="255"
                      placeholder="https://"
                      class="mt-2 block w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/20"
                    />
                  </div>

                  <div>
                    <label for="social" class="block text-sm font-medium text-gray-900">YouTube / Social</label>
                    <input
                      id="social"
                      v-model="form.social"
                      type="text"
                      maxlength="255"
                      placeholder="Channel / profile URL"
                      class="mt-2 block w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/20"
                    />
                  </div>
                </div>

                <div class="grid gap-6 sm:grid-cols-2">
                  <div>
                    <label for="country" class="block text-sm font-medium text-gray-900">Country</label>
                    <input
                      id="country"
                      v-model="form.country"
                      type="text"
                      autocomplete="country-name"
                      maxlength="80"
                      class="mt-2 block w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/20"
                      required
                    />
                  </div>

                  <div>
                    <label for="monthlyTraffic" class="block text-sm font-medium text-gray-900">Monthly traffic</label>
                    <input
                      id="monthlyTraffic"
                      v-model="form.monthlyTraffic"
                      type="text"
                      maxlength="120"
                      placeholder="e.g. 50k visits / month"
                      class="mt-2 block w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/20"
                    />
                  </div>
                </div>

                <div>
                  <label for="promotionPlan" class="block text-sm font-medium text-gray-900">How will you promote?</label>
                  <textarea
                    id="promotionPlan"
                    v-model="form.promotionPlan"
                    rows="6"
                    maxlength="2000"
                    placeholder="Tell us about your strategy, channels, and audience..."
                    class="mt-2 block w-full resize-none rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 shadow-sm outline-none focus:border-gray-900 focus:ring-2 focus:ring-gray-900/20"
                  />
                </div>

                <div class="flex items-center justify-between gap-4">
                  <p v-if="error" class="text-sm text-red-600">{{ error }}</p>
                  <div class="ml-auto">
                    <button
                      type="submit"
                      class="inline-flex items-center justify-center rounded-xl bg-gray-900 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                      :disabled="submitting"
                    >
                      <span v-if="submitting">Submitting...</span>
                      <span v-else>Submit application</span>
                    </button>
                  </div>
                </div>
              </form>
            </div>

            <p class="mt-6 text-center text-sm text-gray-500">
              By submitting, you agree to be contacted about the partner program.
            </p>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
const submitting = ref(false)
const submitted = ref(false)
const error = ref('')

const form = reactive({
  name: '',
  email: '',
  website: '',
  social: '',
  country: '',
  monthlyTraffic: '',
  promotionPlan: '',
})

useHead({
  title: 'Partner Application | Casa do Software',
  meta: [
    {
      name: 'description',
      content: 'Apply to join the Casa do Software partner program.',
    },
  ],
})

async function onSubmit() {
  error.value = ''
  submitting.value = true

  try {
    await $fetch('/api/partner-apply', {
      method: 'POST',
      body: {
        name: form.name,
        email: form.email,
        website: form.website,
        social: form.social,
        country: form.country,
        monthlyTraffic: form.monthlyTraffic,
        promotionPlan: form.promotionPlan,
      },
    })

    submitted.value = true
  } catch (e: any) {
    error.value = String(e?.data?.statusMessage || e?.statusMessage || e?.message || 'Could not submit. Please try again.')
  } finally {
    submitting.value = false
  }
}
</script>
