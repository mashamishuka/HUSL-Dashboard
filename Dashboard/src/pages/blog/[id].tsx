import { MainLayout } from '@components/Layouts/MainLayout'
import { Wrapper } from '@components/Layouts/Wrapper'

import { EditBlogForm } from '@components/Forms/EditBlog'

import type { NextLayoutComponentType } from 'next'
const EditArticleBlogPage: NextLayoutComponentType = () => {
  return (
    <Wrapper title="Manage Blog Article">
      <EditBlogForm />
    </Wrapper>
  )
}

EditArticleBlogPage.getLayout = function getLayout(page) {
  return <MainLayout children={page} />
}

export default EditArticleBlogPage
