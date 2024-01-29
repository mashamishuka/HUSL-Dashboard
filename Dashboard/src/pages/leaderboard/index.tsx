import { MainLayout } from '@components/Layouts/MainLayout'
import { Wrapper } from '@components/Layouts/Wrapper'
import { Leaderboard } from '@components/Leaderboard'

import type { NextLayoutComponentType } from 'next'

const LeaderboardPage: NextLayoutComponentType = () => {
  return (
    <div>
      <Wrapper>
        <Leaderboard />
      </Wrapper>
    </div>
  )
}

LeaderboardPage.getLayout = function getLayout(page) {
  return <MainLayout children={page} />
}

export default LeaderboardPage
