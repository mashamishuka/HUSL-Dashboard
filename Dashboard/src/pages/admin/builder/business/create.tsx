import { useRouter } from 'next/router'
import { MdChevronLeft } from 'react-icons/md'

// prettier-ignore
import {
    InitialBusinessForm
} from '@components/Forms/admin/BusinessBuilder/Builder/InitialBusinessForm'
import { AdminLayout } from '@components/Layouts/AdminLayout'
import { Wrapper } from '@components/Layouts/Wrapper'

import type { NextLayoutComponentType } from 'next'
const CreateBusinessPage: NextLayoutComponentType = () => {
  const { push } = useRouter()
  return (
    <div>
      <button onClick={() => push('/admin/builder/business')} className="flex items-center mb-3 space-x-2">
        <MdChevronLeft size={16} />
        <span>See Business List</span>
      </button>

      <Wrapper title="Create Business" className="flex flex-col space-y-5">
        <InitialBusinessForm />
      </Wrapper>
    </div>
  )
}

CreateBusinessPage.getLayout = function getLayout(page) {
  return <AdminLayout children={page} />
}

export default CreateBusinessPage
