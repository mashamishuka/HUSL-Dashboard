import { useRouter } from 'next/router'
import { MdChevronLeft } from 'react-icons/md'

import { AdminLayout } from '@components/Layouts/AdminLayout'
import { Wrapper } from '@components/Layouts/Wrapper'

import type { NextLayoutComponentType } from 'next'
import Button from '@components/Button'
import { GraphicTemplateListTable } from '@components/DataTables/GraphicTemplateList'

const GraphicGenerator: NextLayoutComponentType = () => {
  const { push } = useRouter()
  return (
    <div>
      <button onClick={() => push('/admin/accounts')} className="flex items-center mb-3 space-x-2">
        <MdChevronLeft size={16} />
        <span>Back to Account List</span>
      </button>

      <Wrapper
        title="Graphic Templates"
        actionEl={
          <div className="relative flex items-center space-x-3">
            <Button text="Create Template" url="/admin/generator/graphics/editor" />
          </div>
        }>
        <GraphicTemplateListTable />
      </Wrapper>
    </div>
  )
}

GraphicGenerator.getLayout = function getLayout(page) {
  return <AdminLayout children={page} />
}

export default GraphicGenerator
