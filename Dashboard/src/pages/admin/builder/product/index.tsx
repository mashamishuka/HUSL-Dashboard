import { useRouter } from 'next/router'
import { MdChevronLeft } from 'react-icons/md'

import { AdminLayout } from '@components/Layouts/AdminLayout'
import { Wrapper } from '@components/Layouts/Wrapper'

import { ProductListTable } from '@components/DataTables/ProductList'

import type { NextLayoutComponentType } from 'next'
import Button from '@components/Button'

const CreateProductPage: NextLayoutComponentType = () => {
  const { push } = useRouter()

  return (
    <div>
      <button onClick={() => push('/admin/accounts')} className="flex items-center mb-3 space-x-2">
        <MdChevronLeft size={16} />
        <span>Back to Account List</span>
      </button>

      <Wrapper
        title="Product"
        actionEl={
          <div className="relative flex items-center space-x-3">
            <Button url="/admin/builder/product/create" text="Create New Product" />
          </div>
        }
        className="flex flex-col space-y-5">
        <ProductListTable />
      </Wrapper>
    </div>
  )
}

CreateProductPage.getLayout = function getLayout(page) {
  return <AdminLayout children={page} />
}

export default CreateProductPage
