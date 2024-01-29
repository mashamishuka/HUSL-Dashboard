import * as CryptoJS from 'crypto-js'

export const decryptHuslPassword = (password: string, keyFormula: string) => {
  if (!password && !keyFormula) return ''
  const bytes = CryptoJS.AES.decrypt(password, keyFormula)
  const originalText = bytes.toString(CryptoJS.enc.Utf8)
  return originalText
}
