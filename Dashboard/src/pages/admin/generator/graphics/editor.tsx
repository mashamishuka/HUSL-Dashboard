import dynamic from 'next/dynamic'
import { useEffect } from 'react'
import { GET_TEMPLATE } from '@src/restapi/graphicTemplates/constants'

import type { GetServerSidePropsContext, NextLayoutComponentType } from 'next'
import api from '@services/api'
import { getSession } from 'next-auth/react'

const ImageEditor = dynamic(() => import('@components/Editor/ImglyImageEditor'), {
  ssr: false
})

interface ImageEditorPageProps {
  templateId?: string
  sceneUrl?: string
  template?: GraphicTemplate
}
const ImageEditorPage: NextLayoutComponentType<ImageEditorPageProps> = ({ templateId, template, sceneUrl }) => {
  useEffect(() => {
    if (!template) return
    if (templateId && !template?._id) {
      window.location.href = `/admin/generator/graphics/editor`
    }
  }, [template])
  return <ImageEditor templateId={templateId} sceneUrl={sceneUrl} template={template} />
}

export const getServerSideProps = async (ctx: GetServerSidePropsContext) => {
  const session = await getSession(ctx)
  const query = ctx.query
  const templateId = query?.templateId as string
  if (!templateId) {
    return {
      props: {
        template: null,
        templateId: null,
        sceneUrl: null
      }
    }
  }
  const template = await api
    .get(GET_TEMPLATE + templateId, {
      headers: {
        Authorization: `Bearer ${session?.jwt}`
      }
    })
    .then(({ data }) => data?.data)
    .catch(() => null)

  return {
    props: {
      template: template || null,
      templateId,
      sceneUrl: template?.scene?.url || null
    }
  }
}
export default ImageEditorPage
