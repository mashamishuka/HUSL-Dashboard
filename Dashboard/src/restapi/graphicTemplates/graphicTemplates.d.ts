interface GraphicTemplate {
  _id: string
  name: string
  slug: string
  scene: FileManager.FileResponse
  preview: FileManager.FileResponse
  createdAt: string | Date
  createdBy?: {
    _id: string & {
      $oid: string
    }
    name: string
    email?: string
  }
  trashed?: boolean
}
interface CreateGraphicTemplateDto {
  _id?: string
  name: string
  scene?: FileManager.FileResponse
  preview?: FileManager.FileResponse
}
