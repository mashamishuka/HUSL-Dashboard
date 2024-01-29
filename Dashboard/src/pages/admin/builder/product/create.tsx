import { useRouter } from 'next/router'
import { MdChevronLeft } from 'react-icons/md'

import { CreateProductForm } from '@components/Forms/admin/BusinessBuilder/Product'
import { AdminLayout } from '@components/Layouts/AdminLayout'
import { Wrapper } from '@components/Layouts/Wrapper'

import type { NextLayoutComponentType } from 'next'
const CreateProductPage: NextLayoutComponentType = () => {
  const { push } = useRouter()

  return (
    <div>
      <button onClick={() => push('/admin/builder/product')} className="flex items-center mb-3 space-x-2">
        <MdChevronLeft size={16} />
        <span>See Product List</span>
      </button>

      <Wrapper title="Create Product" className="flex flex-col space-y-5">
        <CreateProductForm />
      </Wrapper>
    </div>
  )
}

CreateProductPage.getLayout = function getLayout(page) {
  return <AdminLayout children={page} />
}

export default CreateProductPage
