import { NextLayoutComponentType } from 'next'
import { useState } from 'react'

import Button from '@components/Button'
import { CourseListTable } from '@components/DataTables/CourseList'
import { AdminLayout } from '@components/Layouts/AdminLayout'
import { Wrapper } from '@components/Layouts/Wrapper'
import { AddCourse } from '@components/Modals/AddCourse'

const CourseGenerator: NextLayoutComponentType = () => {
  const [showCourseModal, setShowCourseModal] = useState(false)
  return (
    <div className="flex flex-col space-y-8">
      <Wrapper title="Course List" actionEl={<Button onClick={() => setShowCourseModal(true)}>Add Course</Button>}>
        <div className="max-w-full overflow-x-auto md:max-w-none md:overflow-visible">
          <CourseListTable />
        </div>
      </Wrapper>
      <AddCourse show={showCourseModal} onClose={() => setShowCourseModal(false)} />
    </div>
  )
}

CourseGenerator.getLayout = function getLayout(page) {
  return <AdminLayout children={page} />
}

export default CourseGenerator
