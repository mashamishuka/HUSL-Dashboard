import type { NextLayoutComponentType } from 'next'
// import { PixelTrackingChart, GoogleAnalyticsChart } from '@components/Charts'
import { AccountListTable } from '@components/DataTables/AccountList'
import { AdminLayout } from '@components/Layouts/AdminLayout'

const AdminAccountPage: NextLayoutComponentType = () => {
  return (
    <div className="flex flex-col space-y-5">
      <AccountListTable />

      {/* <div className="grid md:grid-cols-2 md:gap-x-5 gap-y-5 md:gap-y-0">
        <Wrapper title="Pixel/Tracking">
          <PixelTrackingChart />
        </Wrapper>
        <Wrapper title="Google Analytics" subtitle="Cancellation Over Time">
          <div className="w-7/12 mx-auto">
            <GoogleAnalyticsChart />
          </div>
        </Wrapper>
      </div> */}
    </div>
  )
}

AdminAccountPage.getLayout = function getLayout(page) {
  return <AdminLayout children={page} />
}

export default AdminAccountPage
