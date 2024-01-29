import { toCurrency } from './toCurrency'

export const transformCents = (amount?: number, noConvert = false) => {
  if (!amount) return '-'
  if (amount == 0) return toCurrency(0)
  const n = Number(amount) / 100
  if (noConvert) return n
  return toCurrency(n)
}

export const transformDollars = (amount?: number, noConvert = false) => {
  if (!amount) return '-'
  if (amount == 0) return toCurrency(0)
  const n = Number(amount)
  if (noConvert) return n
  return toCurrency(n)
}
