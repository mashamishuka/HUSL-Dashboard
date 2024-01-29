import { MainLayout } from '@components/Layouts/MainLayout'
import { Wrapper } from '@components/Layouts/Wrapper'

import type { NextLayoutComponentType } from 'next'
import { AddBlogForm } from '@components/Forms/AddBlog'

const AddArticleBlogPage: NextLayoutComponentType = () => {
  return (
    <Wrapper title="Add New Blog Article">
      <AddBlogForm />
    </Wrapper>
  )
}

AddArticleBlogPage.getLayout = function getLayout(page) {
  return <MainLayout children={page} />
}

export default AddArticleBlogPage
