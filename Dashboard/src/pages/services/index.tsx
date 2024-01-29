import { MainLayout } from '@components/Layouts/MainLayout'
import type { NextLayoutComponentType } from 'next'
import { Services } from '@components/Service'
import { Wrapper } from '@components/Layouts/Wrapper'

const ServicesPage: NextLayoutComponentType = () => {
  return (
    <Wrapper title="AutoPilot">
      <Services />
    </Wrapper>
  )
}

ServicesPage.getLayout = function getLayout(page) {
  return <MainLayout children={page} />
}

export default ServicesPage
