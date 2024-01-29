import { MainLayout } from '@components/Layouts/MainLayout'
import { Wrapper } from '@components/Layouts/Wrapper'

import { EditBlogCategoryForm } from '@components/Forms/EditBlogCategory'

import type { NextLayoutComponentType } from 'next'

const EditArticleBlogCategoryPage: NextLayoutComponentType = () => {
  return (
    <Wrapper title="Manage Blog Category">
      <EditBlogCategoryForm />
    </Wrapper>
  )
}

EditArticleBlogCategoryPage.getLayout = function getLayout(page) {
  return <MainLayout children={page} />
}

export default EditArticleBlogCategoryPage
