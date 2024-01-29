import { useRouter } from 'next/router'
import { MdChevronLeft } from 'react-icons/md'

import { AdminLayout } from '@components/Layouts/AdminLayout'
import { Wrapper } from '@components/Layouts/Wrapper'

import { EditProductForm } from '@components/Forms/admin/BusinessBuilder/EditProduct'
import type { NextLayoutComponentType } from 'next'

const CreateProductPage: NextLayoutComponentType = () => {
  const { push } = useRouter()

  return (
    <div>
      <button onClick={() => push('/admin/builder/product')} className="flex items-center mb-3 space-x-2">
        <MdChevronLeft size={16} />
        <span>See Existing Product List</span>
      </button>

      <Wrapper title="Edit Product" className="flex flex-col space-y-5">
        <EditProductForm />
      </Wrapper>
    </div>
  )
}

CreateProductPage.getLayout = function getLayout(page) {
  return <AdminLayout children={page} />
}

export default CreateProductPage
