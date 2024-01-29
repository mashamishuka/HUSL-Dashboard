export const cutString = (str: string, cutStart: number, cutEnd: number) => {
  if (str.length <= 10) return str
  const first = str.slice(0, cutStart)
  const last = str.slice(-cutEnd)
  return first + '...' + last
}
