import { MdAdd, MdArticle } from 'react-icons/md'

import Button from '@components/Button'
import { MainLayout } from '@components/Layouts/MainLayout'
import { Wrapper } from '@components/Layouts/Wrapper'

import { BlogCategoriesTable } from '@components/DataTables/BlogCategories'

import type { NextLayoutComponentType } from 'next'

const WebsiteBlogCategoryPage: NextLayoutComponentType = () => {
  return (
    <div className="flex flex-col space-y-3">
      <div className="flex justify-end space-x-3">
        <Button url="/blog" variant="outline" rounded="xl" className="flex items-center px-5 py-3 mb-3 space-x-1 font-light">
          <MdArticle />
          <span>Blog List</span>
        </Button>
        <Button
          url="/blog/categories/add"
          variant="outline"
          rounded="xl"
          className="flex items-center px-5 py-3 mb-3 space-x-1 font-light">
          <MdAdd />
          <span>Add Category</span>
        </Button>
      </div>
      <Wrapper title="Blog Categories">
        <div className="max-w-full overflow-x-auto md:max-w-none md:overflow-visible">
          <BlogCategoriesTable />
        </div>
      </Wrapper>
    </div>
  )
}

WebsiteBlogCategoryPage.getLayout = function getLayout(page) {
  return <MainLayout children={page} />
}

export default WebsiteBlogCategoryPage
