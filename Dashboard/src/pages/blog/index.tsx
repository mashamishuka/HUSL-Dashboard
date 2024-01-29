import { MdAdd, MdCategory } from 'react-icons/md'

import Button from '@components/Button'
import { MainLayout } from '@components/Layouts/MainLayout'
import { Wrapper } from '@components/Layouts/Wrapper'

import { BlogListTable } from '@components/DataTables/BlogList'

import type { NextLayoutComponentType } from 'next'

const WebsiteBlogPage: NextLayoutComponentType = () => {
  return (
    <div className="flex flex-col space-y-3">
      <div className="flex justify-end space-x-3">
        <Button
          url="/blog/categories"
          variant="outline"
          rounded="xl"
          className="flex items-center px-5 py-3 mb-3 space-x-1 font-light">
          <MdCategory />
          <span>Categories</span>
        </Button>
        <Button
          url="/blog/add"
          variant="outline"
          rounded="xl"
          className="flex items-center px-5 py-3 mb-3 space-x-1 font-light">
          <MdAdd />
          <span>Add Article</span>
        </Button>
      </div>
      <Wrapper title="Blog">
        <div className="max-w-full overflow-x-auto md:max-w-none md:overflow-visible">
          <BlogListTable />
        </div>
      </Wrapper>
    </div>
  )
}

WebsiteBlogPage.getLayout = function getLayout(page) {
  return <MainLayout children={page} />
}

export default WebsiteBlogPage
