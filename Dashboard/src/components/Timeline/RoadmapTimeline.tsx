import clsx from 'clsx'

import { ArrowRight } from '@components/Icons'
import { GET_USER_ROADMAP } from '@src/restapi/roadmap/constants'
import { Roadmap } from '@src/restapi/roadmap/roadmap'
import useSWR from 'swr'

interface TimelineLineProps {
  className?: string
  position?: 'left' | 'right'
}
const TimelineLine: React.FC<TimelineLineProps> = ({ position, className }) => {
  return (
    <div className={className}>
      <div
        className={clsx('absolute h-full w-full', position === 'left' ? 'left-0' : 'right-[-2px]')}
        style={{
          backgroundImage: 'linear-gradient(black 60%, rgba(255,255,255,0) 0%)',
          backgroundPosition: position === 'left' ? 'left' : 'right',
          backgroundSize: '2px 2.5rem',
          backgroundRepeat: 'repeat-y'
        }}></div>
      <div
        className={clsx(
          'absolute w-10 h-10 flex items-center justify-center rounded-full bg-primary -top-5',
          position === 'left' ? '-left-5' : '-right-5'
        )}>
        <div
          className="rounded-full w-7 h-7"
          style={{
            backgroundImage: 'linear-gradient(96.93deg, #FFFFFF -47.41%, rgba(255, 255, 255, 0.2) 118.78%)'
          }}
        />
      </div>
    </div>
  )
}

export const RoadmapTimeline: React.FC = () => {
  const { data } = useSWR<RestApi.Response<Roadmap>>(GET_USER_ROADMAP)

  return (
    <div className="flex flex-col mt-10 space-y-5 mb-14">
      {data?.data?.roadmaps?.map((roadmap, index) => (
        <div
          key={index}
          className={clsx(
            index % 2 === 0 ? 'md:self-start' : 'md:self-end',
            'relative md:w-1/2 pb-10 mt-5 px-8 ml-3 md:ml-0'
          )}>
          <div>
            <TimelineLine position={index % 2 === 0 ? 'right' : 'left'} className="hidden md:block" />
            <TimelineLine position="left" className="block md:hidden" />
          </div>
          <div className="relative z-50 -mt-3">
            <h3 className="mb-2 text-xl">{roadmap?.title}</h3>
            <ul>
              {roadmap?.items?.map((item, i) => (
                <li key={i} className="flex items-center space-x-2">
                  <ArrowRight />
                  <div className="text-lg font-light" dangerouslySetInnerHTML={{ __html: item }} />
                </li>
              ))}
            </ul>
          </div>
        </div>
      ))}
    </div>
  )
}
