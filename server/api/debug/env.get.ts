export default defineEventHandler(() => {
  return {
    MERCADOPAGO_ACCESS_TOKEN: Boolean(process.env.MERCADOPAGO_ACCESS_TOKEN),
    MERCADOPAGO_PUBLIC_KEY: Boolean(process.env.MERCADOPAGO_PUBLIC_KEY),
    tokenStart: process.env.MERCADOPAGO_ACCESS_TOKEN?.slice(0, 8) || null
  }
})