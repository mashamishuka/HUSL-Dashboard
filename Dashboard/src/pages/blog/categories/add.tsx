import { MainLayout } from '@components/Layouts/MainLayout'
import { Wrapper } from '@components/Layouts/Wrapper'

import type { NextLayoutComponentType } from 'next'
import { AddBlogCategoryForm } from '@components/Forms/AddBlogCategory'

const AddArticleBlogCategoryPage: NextLayoutComponentType = () => {
  return (
    <Wrapper title="Add New Blog Category">
      <AddBlogCategoryForm />
    </Wrapper>
  )
}

AddArticleBlogCategoryPage.getLayout = function getLayout(page) {
  return <MainLayout children={page} />
}

export default AddArticleBlogCategoryPage
