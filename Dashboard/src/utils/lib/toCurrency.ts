// create a function that takes a number and returns a string with the number formatted as currency

export const toCurrency = (num = 0, currency = 'USD', locale = 'en-US'): string => {
  return Number(num).toLocaleString(locale, {
    style: 'currency',
    currency
  })
}
