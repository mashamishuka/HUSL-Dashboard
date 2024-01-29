import React, { useMemo, useState } from 'react'

// import CreativeEngine, { DesignBlockType } from '@cesdk/engine'
import CreativeEditorSDK, { Configuration } from '@cesdk/cesdk-js'
import { useRef, useEffect } from 'react'
// import { DesignBlockType } from '@cesdk/engine'
import { TemplateMetaModal } from '@components/Modals'
import { createOrUpdateTemplate } from '@src/restapi/graphicTemplates/mutations'
import { slugify } from '@utils/index'
import { uploadFile } from '@src/restapi/fileManagers/mutation'
import { toast } from 'react-toastify'

export const ImglyDefaultConfig: Configuration = {
  role: 'Creator',
  theme: 'dark',
  license: process.env.IMGLY_API_KEY,
  presets: {
    typefaces: {
      Recoleta: {
        family: 'Recoleta',
        fonts: [
          {
            fontURL: `https://app.husl.xyz/fonts/recoleta/Recoleta-Regular.ttf`,
            weight: 'normal',
            style: 'normal'
          },
          {
            fontURL: `https://app.husl.xyz/fonts/recoleta/Recoleta-Medium.ttf`,
            weight: 'bold',
            style: 'normal'
          }
        ]
      },
      'Gotham Pro': {
        family: 'Gotham Pro',
        fonts: [
          {
            fontURL: `https://app.husl.xyz/fonts/gotham-pro/GothamPro.ttf`,
            weight: 'normal',
            style: 'normal'
          },
          {
            fontURL: `https://app.husl.xyz/fonts/gotham-pro/GothamPro-Bold.ttf`,
            weight: 'bold',
            style: 'normal'
          }
        ]
      }
    }
  }
}
export interface ImglyEditorProps {
  templateId?: string
  sceneUrl?: string
  template?: GraphicTemplate
}
export const ImglyEditor: React.FC<ImglyEditorProps> = ({ templateId, sceneUrl, template }) => {
  const cesdk_container = useRef(null)
  const engine = useRef<any>(null)
  const cesdk = useRef<CreativeEditorSDK | null>(null)
  const [showManageModal, setShowManageModal] = useState(false)

  const config: Configuration = useMemo(() => {
    return {
      ...ImglyDefaultConfig,
      variables: {
        company: {
          value: 'HUSL App'
        },
        text: {
          value: 'TIRED OF \n SPENDING MORE\nTIME ON\nMARKETING\n THAN ON\nMAKING ?'
        },
        primaryColor: {
          value: '#2D9CDB'
        }
      },
      ui: {
        elements: {
          panels: {
            settings: true
          },
          templates: {
            show: false
          },
          navigation: {
            action: {
              back: true,
              custom: [
                {
                  label: 'Save Template',
                  iconName: 'save',
                  callback: async () => {
                    if (!templateId) {
                      setShowManageModal(true)
                    } else {
                      // const template = await engine.current?.scene.saveToString()
                      let sceneString: any
                      let scene: any = await engine.current?.scene.saveToString()
                      if (scene && template) {
                        scene = new File([scene], slugify(template?.name) + '-' + new Date().getTime() + '.scene')
                        sceneString = await uploadFile(scene, 1, 'scene', scene?.name)
                        if (!sceneString?._id) {
                          toast.error('Error uploading scene')
                          return
                        }
                        const body = {
                          _id: templateId,
                          name: template?.name,
                          scene: sceneString?._id
                        }
                        await createOrUpdateTemplate(body)
                      }
                    }
                  }
                }
              ]
            }
          }
        }
      },
      callbacks: {
        onExport: 'download',
        onSave: (data) => {
          console.log(data)
        },
        onBack: () => {
          window.location.href = '/admin/generator/graphics'
        }
      }
    }
  }, [cesdk, engine])

  useEffect(() => {
    if (cesdk_container.current) {
      const editorConfig = {
        ...config,
        baseURL: '/assets',
        core: {
          baseURL: 'core/'
        },
        initialSceneURL: sceneUrl || '',
        variables: {
          company: {
            value: 'HUSL App'
          },
          text: {
            value: 'TIRED OF \n SPENDING MORE\nTIME ON\nMARKETING\n THAN ON\nMAKING ?'
          },
          primaryColor: {
            value: '#000'
          }
        }
      }
      CreativeEditorSDK.init(cesdk_container.current, editorConfig).then((instance) => {
        // instance.loadFromString(scene)
        // pages
        // const image = instance.engine.block.findByType(DesignBlockType.Image)[0]
        // instance.engine.block.setContentFillMode(image, 'Cover')
        cesdk.current = instance
        engine.current = instance.engine
      })
    }
    return () => {
      if (cesdk) {
        cesdk.current?.dispose()
      }
    }
  }, [config])

  return (
    <div className="relative">
      <div ref={cesdk_container} style={{ width: '100vw', height: '100vh' }}></div>
      <TemplateMetaModal
        show={showManageModal}
        onClose={() => setShowManageModal(false)}
        data={{
          sceneString: engine.current?.scene.saveToString()
        }}
      />
    </div>
  )
}

export default ImglyEditor
