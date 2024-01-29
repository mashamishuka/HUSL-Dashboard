// add https to string if it doesn't exist
export const addHttp = (url: string, ssl = true) => {
  if (url) {
    if (url.indexOf('http') === -1) {
      return ssl ? 'https://' + url : 'http://' + url
    }
  }
  return url
}
