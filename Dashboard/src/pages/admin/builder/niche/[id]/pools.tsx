import { useRouter } from 'next/router'
import { MdChevronLeft } from 'react-icons/md'

import { AdminLayout } from '@components/Layouts/AdminLayout'
import { Wrapper } from '@components/Layouts/Wrapper'

import type { NextLayoutComponentType } from 'next'
import { NichePools } from '@components/NichePools'
const CreateBusinessPage: NextLayoutComponentType = () => {
  const { push } = useRouter()
  return (
    <div>
      <button onClick={() => push('/admin/builder/niche')} className="flex items-center mb-3 space-x-2">
        <MdChevronLeft size={16} />
        <span>See Niche List</span>
      </button>
      <Wrapper title="Niche Pools">
        <NichePools />
      </Wrapper>
    </div>
  )
}

CreateBusinessPage.getLayout = function getLayout(page) {
  return <AdminLayout children={page} />
}

export default CreateBusinessPage
