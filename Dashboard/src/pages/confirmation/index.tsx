import { MainLayout } from '@components/Layouts/MainLayout'
import { Wrapper } from '@components/Layouts/Wrapper'
import type { NextLayoutComponentType } from 'next'

const ConfirmationPage: NextLayoutComponentType = () => {
  return (
    <div className="flex flex-col space-y-5">
      <Wrapper title="Confirmation">
        <p style={{ fontWeight: 100, fontSize: 14, marginBottom: 20, marginTop: 5, opacity: 0.7, maxWidth: 600 }}>
          Thank you for your purchase! We will get started soon!
        </p>
      </Wrapper>
    </div>
  )
}

ConfirmationPage.getLayout = function getLayout(page) {
  return <MainLayout children={page} />
}

export default ConfirmationPage
