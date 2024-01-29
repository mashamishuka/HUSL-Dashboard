import { FileManager } from '@components/FileManager'
import { MainLayout } from '@components/Layouts/MainLayout'

import type { NextLayoutComponentType } from 'next'

const MarketingGraphicPage: NextLayoutComponentType = () => {
  return <FileManager />
}

MarketingGraphicPage.getLayout = function getLayout(page) {
  return <MainLayout children={page} />
}

export default MarketingGraphicPage
