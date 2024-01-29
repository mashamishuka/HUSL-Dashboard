import { WarningAlert } from '@components/Alerts'
import Button from '@components/Button'
import { useState } from 'react'
import { GET_USER_ROADMAP } from '@src/restapi/roadmap/constants'
import { createUserRoadmap } from '@src/restapi/roadmap/mutation'
import { Roadmap, RoadmapItem } from '@src/restapi/roadmap/roadmap'
import clsx from 'clsx'
import { useEffect, useRef } from 'react'
import { MdAdd, MdClose, MdDelete, MdSave } from 'react-icons/md'
import { toast } from 'react-toastify'
import { useList } from 'react-use'
import useSWR from 'swr'
import { linkify } from '@utils/index'

const TimelineLine: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={className}>
      <div
        className={clsx('absolute h-full w-full left-3')}
        style={{
          backgroundImage: 'linear-gradient(black 60%, rgba(255,255,255,0) 0%)',
          backgroundPosition: 'left',
          backgroundSize: '2px 2.5rem',
          backgroundRepeat: 'repeat-y'
        }}></div>
      <div className={clsx('absolute w-6 h-6 flex items-center justify-center rounded-full bg-primary top-0 left-0')}>
        <div
          className="w-4 h-4 rounded-full"
          style={{
            backgroundImage: 'linear-gradient(96.93deg, #FFFFFF -47.41%, rgba(255, 255, 255, 0.2) 118.78%)'
          }}
        />
      </div>
    </div>
  )
}

const newTimeline = {
  title: 'Add Title',
  items: []
}
export const RoadmapCreator: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const { data } = useSWR<RestApi.Response<Roadmap>>(GET_USER_ROADMAP)

  const timelineRef = useRef<HTMLDivElement>(null)
  const [timelines, { push, updateAt, removeAt, set }] = useList<RoadmapItem>([
    {
      title: 'Add Title / Year',
      items: ['Add item...']
    }
  ])

  const handleSaveTimeline = async () => {
    setLoading(true)
    try {
      const timelineEl = timelineRef.current
      if (!timelineEl) return
      const timeline = timelineEl.getElementsByClassName('timeline')
      const timelineData = []
      // loop timeline and get all the data
      for (let t = 0; t < timeline.length; t++) {
        const tEl = timeline[t]
        const title = tEl.querySelectorAll('[data-timeline="title"]')?.[0]?.innerHTML
        const items = tEl.querySelectorAll('[data-timeline="items"]')
        const itemsData = []
        for (let i = 0; i < items.length; i++) {
          const iEl = items[i]
          const item = iEl.getElementsByTagName('div')[0].innerHTML
          itemsData.push(linkify(item))
        }
        timelineData.push({ title, items: itemsData })
      }
      await createUserRoadmap(timelineData)
      toast.success('Roadmap timeline saved.')
    } catch (error) {
      toast.error('Error saving data. Try again later.')
    }
    setLoading(false)
  }

  useEffect(() => {
    if (data) {
      set(data?.data?.roadmaps)
    }
  }, [data])

  return (
    <div className="flex flex-col space-y-5">
      {timelines?.length === 0 && (
        <WarningAlert>To create a new timeline item, please click Add Milestone button bellow.</WarningAlert>
      )}
      <div ref={timelineRef} className="flex flex-col space-y-5">
        {timelines?.map((timeline, index) => (
          <div key={index} className={clsx('relative pb-10 px-8 ml-3 md:ml-0 timeline')}>
            <div>
              <TimelineLine />
            </div>
            <div className="relative z-10">
              <div className="flex space-x-5">
                <h2
                  className="text-xl text-primary focus:outline-none"
                  data-timeline="title"
                  contentEditable
                  suppressContentEditableWarning>
                  {timeline?.title}
                </h2>
                <button
                  onClick={() => {
                    removeAt(index)
                  }}>
                  <MdDelete />
                </button>
              </div>
              <ul className="mt-3 ml-5">
                {timeline?.items?.map((item, itemIndex) => (
                  <li key={itemIndex} className="flex items-center space-x-3" data-timeline="items">
                    <div
                      className="text-lg font-light focus:outline-none"
                      data-timeline="item"
                      contentEditable
                      suppressContentEditableWarning
                      dangerouslySetInnerHTML={{ __html: item }}
                    />
                    {timeline?.items && itemIndex === timeline?.items?.length - 1 && (
                      <button
                        onClick={() => {
                          updateAt(index, {
                            ...timeline,
                            items: timeline?.items?.filter((_, i) => i !== itemIndex)
                          })
                        }}>
                        <MdClose />
                      </button>
                    )}
                  </li>
                ))}
                <li
                  className="inline-flex items-center space-x-2 text-primary"
                  role="button"
                  onClick={() =>
                    updateAt(index, {
                      ...timeline,
                      items: [...(timeline?.items || []), 'Add item...']
                    })
                  }>
                  <MdAdd /> Add Item
                </li>
              </ul>
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center space-x-3">
        <Button
          size="sm"
          className="flex items-center mt-3 space-x-1"
          variant="outline"
          onClick={handleSaveTimeline}
          loading={loading}
          disabled={loading}>
          <MdSave />
          <span>Save Changes</span>
        </Button>
        <Button size="sm" className="flex items-center mt-3 space-x-1" onClick={() => push(newTimeline)}>
          <MdAdd />
          <span>Add Milestone</span>
        </Button>
      </div>
    </div>
  )
}
