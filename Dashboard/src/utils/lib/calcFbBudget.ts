import { toCurrency } from './toCurrency'

export const calcFbBudget = (budget?: string) => {
  if (!budget) return '-'
  if (budget === '0') return toCurrency(0)
  const n = Number(budget) / 100
  return toCurrency(n)
}
