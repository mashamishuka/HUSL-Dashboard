export const callbackAvatar = (url?: string | null, text?: string) => {
  if (url) {
    return url
  }
  return `https://ui-avatars.com/api/?name=${text}&rounded=true&background=random`
}
