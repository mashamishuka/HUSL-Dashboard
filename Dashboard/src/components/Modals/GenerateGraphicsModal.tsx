import { Fragment, useEffect, useState, useMemo } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/20/solid'
import { MdDownload, MdImage, MdImportExport, MdInfo } from 'react-icons/md'
import Button from '@components/Button'
import { toast } from 'react-toastify'
import CreativeEngine from '@cesdk/engine'
import { ImglyDefaultConfig } from '@components/Editor/ImglyImageEditor'
import * as generator from '@utils/lib/templateGenerator'
import { useRouter } from 'next/router'
import { useBusiness } from '@hooks/useBusiness'
import { slugify } from '@utils/index'
import api from '@services/api'
import { updateBusiness } from '@src/restapi/businesses/mutation'
import useSWR from 'swr'
import { GET_TEMPLATE } from '@src/restapi/graphicTemplates/constants'

interface GenerateGraphicsProps {
  open?: boolean
  onClose?: () => void
  businessId?: string
  userId?: string
}
// TODO: maybe make the templates more dynamic ?
const availableTemplates = [
  {
    name: 'blockquote',
    preview: '/assets/templates/blockquote.png',
    scene: '/assets/templates/blockquote.scene'
  },
  {
    name: 'mockup-desktop',
    preview: '/assets/templates/mockup-desktop.png',
    scene: '/assets/templates/mockup-desktop.scene'
  },
  {
    name: 'mockup-mobile',
    preview: '/assets/templates/mockup-mobile.png',
    scene: '/assets/templates/mockup-mobile.scene'
  }
]
export const GenerateGraphicsModal: React.FC<GenerateGraphicsProps> = ({ open, onClose }) => {
  const { query } = useRouter()
  const businessId = query?.businessId as string
  const { data } = useBusiness(businessId)
  const { data: initialTemplates } = useSWR<RestApi.Response<GraphicTemplate[]>>(GET_TEMPLATE)

  const [selectedTemplate, setSelectedTemplate] = useState<string[]>()
  const [generating, setGenerating] = useState(false)
  const [generatedGraphics, setGeneratedGraphics] = useState<any[]>([])
  const [downloading, setDownloading] = useState(false)
  const [saving, setSaving] = useState(false)

  const templates = useMemo(() => {
    const mapTemplate = initialTemplates?.data?.map((v) => ({
      name: v.slug,
      preview: v.preview?.url || '',
      scene: v.scene?.url || ''
    }))
    if (mapTemplate) {
      return [...mapTemplate, ...availableTemplates]
    }
    return availableTemplates
  }, [initialTemplates])

  const handleGenerateGraphics = async () => {
    if (!selectedTemplate || selectedTemplate.length === 0) {
      toast.error('Please select at least one template.')
      return
    }
    ImglyDefaultConfig.baseURL = '/assets'
    setGenerating(true)
    const generated = await Promise.all(
      selectedTemplate.map(async (template) => {
        return await CreativeEngine.init(ImglyDefaultConfig).then(async (engine) => {
          const selected = templates.filter((t) => t.name === template)?.[0]
          let url = selected?.scene
          if (!url.startsWith('https://')) {
            url = `${window.location.protocol}//${window.location.host}` + selected?.scene
          }
          const scene = await engine.scene.loadFromURL(url)
          if (template === 'blockquote') {
            try {
              const blockquote = await generator.blockquote(engine, data?.data)
              if (blockquote) {
                return {
                  generated: true,
                  name: 'blockquote',
                  image: blockquote
                }
              } else {
                return {
                  generated: false,
                  name: 'blockquote',
                  image: null
                }
              }
            } catch (_) {
              return {
                generated: false,
                name: 'blockquote',
                image: null
              }
            }
          }
          if (template === 'generic-graphic') {
            try {
              const backgroundHightlight = await generator.genericGraphic(engine, data?.data)
              if (backgroundHightlight) {
                return {
                  generated: true,
                  name: 'generic-graphic',
                  image: backgroundHightlight
                }
              } else {
                return {
                  generated: false,
                  name: 'generic-graphic',
                  image: null
                }
              }
            } catch (_) {
              return {
                generated: false,
                name: 'background-highlight',
                image: null
              }
            }
          }
          if (template === 'mockup-desktop') {
            try {
              const mockupDesktop = await generator.mockupDesktop(engine, data?.data)
              if (mockupDesktop) {
                return {
                  generated: true,
                  name: 'mockup-desktop',
                  image: mockupDesktop
                }
              } else {
                return {
                  generated: false,
                  name: 'mockup-desktop',
                  image: null
                }
              }
            } catch (_) {
              return {
                generated: false,
                name: 'mockup-desktop',
                image: null
              }
            }
          }
          if (template === 'mockup-mobile') {
            try {
              const mockupMobile = await generator.mockupMobile(engine, data?.data)
              if (mockupMobile) {
                return {
                  generated: true,
                  name: 'mockup-mobile',
                  image: mockupMobile
                }
              } else {
                return {
                  generated: false,
                  name: 'mockup-mobile',
                  image: null
                }
              }
            } catch (_) {
              return {
                generated: false,
                name: 'mockup-mobile',
                image: null
              }
            }
          }
          if (template === 'plain-image') {
            try {
              const plainImage = await generator.plainImage(engine, data?.data)
              if (plainImage) {
                return {
                  generated: true,
                  name: 'plain-image',
                  image: plainImage
                }
              } else {
                return {
                  generated: false,
                  name: 'plain-image',
                  image: null
                }
              }
            } catch (_) {
              return {
                generated: false,
                name: 'plain-image',
                image: null
              }
            }
          }
          if (template === 'mobile-desktop-ads') {
            try {
              const desktopAds = await generator.mobileDesktopAds(engine, data?.data)
              if (desktopAds) {
                return {
                  generated: true,
                  name: 'mobile-desktop-ads',
                  image: desktopAds
                }
              } else {
                return {
                  generated: false,
                  name: 'mobile-desktop-ads',
                  image: null
                }
              }
            } catch (e) {
              console.log(e)
              return {
                generated: false,
                name: 'plain-image',
                image: null
              }
            }
          }
          if (template === 'mobile-mobile-ads') {
            try {
              const mobileAds = await generator.mobileMobileAds(engine, data?.data)
              if (mobileAds) {
                return {
                  generated: true,
                  name: 'mobile-mobile-ads',
                  image: mobileAds
                }
              } else {
                return {
                  generated: false,
                  name: 'mobile-mobile-ads',
                  image: null
                }
              }
            } catch (e) {
              console.log(e)
              return {
                generated: false,
                name: 'mobile-mobile-ads',
                image: null
              }
            }
          }
          engine.dispose()
          return scene
        })
      })
    )
    const hasError = generated.filter((g: any) => g.generated === false)
    if (hasError.length > 0) {
      toast.warning(`Generated ${generated.length} graphics. with ${hasError.length} errors.`)
    } else {
      toast.success(`Generated ${generated.length} graphics.`)
    }
    setGeneratedGraphics(generated)
    setGenerating(false)
  }
  const downloadZip = async () => {
    if (!generatedGraphics || !generatedGraphics?.length) {
      toast.error('Please generate graphics first.')
      return
    }
    const { zipFiles } = await import('@utils/index')
    setDownloading(true)
    const blobs = []
    for (let i = 0; i < generatedGraphics.length; i++) {
      const blob = {
        input: await fetch(generatedGraphics[i].image),
        name: generatedGraphics[i].name + '.png'
      }
      blobs.push(blob)
    }
    const zip = await zipFiles(blobs)
    // create a download link
    const link = document.createElement('a')
    link.href = window.URL.createObjectURL(zip)
    link.download = slugify(data?.data?.name || '') + '-graphics.zip'
    link.click()
    // delete blob after download
    window.URL.revokeObjectURL(link.href)
    setDownloading(false)
  }
  const saveGraphicToBusiness = async (graphics: any[]) => {
    await updateBusiness(businessId, {
      generatedGraphics: graphics
    }).catch(() => console.error('Error saving generated graphics to business.'))
  }
  const uploadFile = async (file: File, count: number, folder: string, defaultName?: string) => {
    const body = new FormData()
    let name = defaultName
    if (count > 1) {
      name = file.name
    }

    // if name is not with extension, add it
    if (name && !name.includes('.')) {
      name = name + '.' + file?.name.split('.').pop()
    }
    // if folder is not ending with /, add it
    if (folder && !folder.endsWith('/')) {
      folder = folder + '/'
    }
    // if folder is start with /, remove it
    if (folder.startsWith('/')) {
      folder = folder.substring(1)
    }

    const key = folder + name

    body.append('file', file)
    body.append('filename', key)
    body.append('user', data?.data?.user?._id || '')

    setSaving(true)
    return await api
      .post('/files/upload', body)
      .then(({ data }) => data)
      .catch(() => false)
  }
  const saveToDrive = async () => {
    const user = data?.data?.user
    if (!user?._id) {
      toast.error('You must first generate the business and fill the account information.', {
        autoClose: 15 * 1000
      })
      return
    }
    const files: File[] = []
    for (let i = 0; i < generatedGraphics.length; i++) {
      const file = new File([await (await fetch(generatedGraphics[i].image)).blob()], generatedGraphics[i].name + '.png')
      files.push(file)
    }
    if (!files || !files.length) {
      toast.error('No graphics generated.')
      return
    }

    let successCount = 0
    toast.loading(`Saving 1/${files.length} graphics...`, {
      toastId: 'graphics-upload',
      autoClose: false
    })
    const graphics = []
    for (let i = 0; i < files?.length; i++) {
      const uploadSuccess = await uploadFile(files?.[i], files.length, '', files?.[i]?.name).then(({ data }) => data?._id)
      if (uploadSuccess) {
        successCount++
      }
      graphics.push(uploadSuccess)
      toast.update('graphics-upload', {
        render: `Saving ${i + 1}/${files.length} graphics...`
      })
    }
    // save graphic to business
    saveGraphicToBusiness(graphics)

    toast.update('graphics-upload', {
      render: `Saved ${files.length} graphics. ${successCount} successful.`,
      type: 'success',
      autoClose: 5000,
      isLoading: false
    })
    setSaving(false)
  }

  useEffect(() => {
    const graphicTemplates = templates.map((template) => template.name)
    setSelectedTemplate(graphicTemplates)
    return () => {
      onClose?.()
      setSelectedTemplate(undefined)
      setGenerating(false)
    }
  }, [templates])
  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog as="div" className="fixed inset-0 z-50 overflow-y-auto" onClose={() => null}>
        <div className="min-h-screen px-4 text-center">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0">
            <Dialog.Overlay className="fixed inset-0 bg-opacity-50 bg-dark backdrop-blur-md" />
          </Transition.Child>

          {/* This element is to trick the browser into centering the modal contents. */}
          <span className="inline-block h-screen align-middle" aria-hidden="true">
            &#8203;
          </span>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95">
            <div className="relative inline-block w-full px-6 pt-6 pb-6 overflow-hidden text-left align-middle transition-all transform border border-gray-700 rounded-lg bg-secondary md:w-[56rem]">
              <button type="button" className="absolute right-5 top-3" onClick={() => onClose && onClose()}>
                <XMarkIcon width={24} />
              </button>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="mr-3">
                    <MdImage className="text-xl" />
                  </div>
                  <b className="text-lg font-bold">Generate Graphics</b>
                </div>
              </div>
              <div className="flex flex-col mt-5 space-y-5">
                <div>
                  <p className="mb-2">Choose Templates</p>
                  <div className="grid grid-cols-6 gap-3">
                    {templates.map((template, index) => (
                      <label key={index} className="relative">
                        <img
                          src={template.preview}
                          alt={template.name}
                          className="object-contain mx-auto rounded-md max-h-32"
                        />
                        <div className="absolute flex items-center justify-center rounded-full top-3 left-3">
                          <input
                            type="checkbox"
                            className="w-4 h-4 rounded-full text-primary"
                            onChange={() => {
                              setSelectedTemplate((prev) => {
                                if (prev?.includes(template.name)) {
                                  return prev.filter((item) => item !== template.name)
                                }
                                if (!prev) return [template.name]
                                return [...prev, template.name]
                              })
                            }}
                            checked={selectedTemplate?.includes(template.name)}
                          />
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {generatedGraphics && generatedGraphics.length > 0 && (
                  <div>
                    <p className="mb-2">Generated Graphics</p>
                    <div className="grid grid-cols-6 gap-3">
                      {generatedGraphics.map((graphic, index) => (
                        <div key={index} className="relative">
                          <img
                            src={graphic.image}
                            alt={graphic.name}
                            className="object-contain mx-auto rounded-md max-h-32"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className="mt-5">
                <div className="flex items-center space-x-3">
                  <Button
                    text={generatedGraphics?.length == 0 ? 'Generate' : 'Re-generate'}
                    onClick={handleGenerateGraphics}
                    loading={generating}
                    disabled={generating || saving}
                  />
                  {generatedGraphics && generatedGraphics.length > 0 && (
                    <>
                      <Button
                        onClick={saveToDrive}
                        variant="outline"
                        className="flex items-center space-x-2 border border-primary"
                        loading={saving}
                        disabled={saving}>
                        <MdImportExport />
                        <span>Save to Drive</span>
                      </Button>
                      <Button
                        onClick={downloadZip}
                        variant="outline"
                        className="flex items-center space-x-2 border border-primary"
                        loading={downloading}
                        disabled={downloading || saving}>
                        <MdDownload />
                        <span>Download</span>
                      </Button>
                    </>
                  )}
                </div>
                {generatedGraphics?.length == 0 && (
                  <span className="flex items-center mt-2 space-x-2 text-sm text-blue-400">
                    <MdInfo />
                    <span>Once generating, please wait for the generation complete. It may take several minutes.</span>
                  </span>
                )}
              </div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  )
}
