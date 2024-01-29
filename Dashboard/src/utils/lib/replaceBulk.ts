export const replaceBulk = (str?: string, findArray?: string[], replaceArray?: string[]) => {
  if (!str || !findArray || !replaceArray) return str
  let i,
    regex: any = []
  const map: any = {}
  for (i = 0; i < findArray.length; i++) {
    regex.push(findArray[i].replace(/([-[\]{}()*+?.\\^$|#,])/g, '\\$1'))
    map[findArray[i]] = replaceArray[i]
  }
  regex = regex.join('|')
  str = str?.replace(new RegExp(regex, 'g'), function (matched) {
    return map[matched]
  })
  return str
}
