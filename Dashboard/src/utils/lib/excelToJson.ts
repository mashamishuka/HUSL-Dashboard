import { read, utils } from 'xlsx'

// create a function to convert excel to json
export const excelToJson = (file: File): Promise<Record<string, any>[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (event) => {
      const binaryData = event.target?.result
      const workbook = read(binaryData, { type: 'binary' })
      const sheetName = workbook.SheetNames[0]
      const sheetData: any = utils.sheet_to_json(workbook.Sheets[sheetName])
      resolve(sheetData)
    }
    reader.onerror = (event) => {
      reject(`Error reading ${file.name}: ${event.target?.result}`)
    }
    reader.readAsBinaryString(file)
  })
}
