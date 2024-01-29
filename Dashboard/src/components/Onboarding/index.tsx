import { Disclosure } from '@headlessui/react'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import { useList } from 'react-use'
import { DropTargetMonitor, useDrag, useDrop } from 'react-dnd'
import { XYCoord } from 'dnd-core'
import update from 'immutability-helper'
import clsx from 'clsx'
import { MdChevronLeft, MdDelete, MdDragHandle, MdEdit } from 'react-icons/md'
import { deleteOnboardingItem, updateOrder } from '@src/restapi/onboardings/mutation'
import { confirm } from '@components/ConfirmationBox'
import { VideoPlayer } from '@components/VideoPlayer'
import { mutate } from 'swr'
import { GET_ONBOARDINGS_ITEM } from '@src/restapi/onboardings/constants'
import { toast } from 'react-toastify'
import { AddSocialCompact } from '@components/Forms/AddSocialCompact'
import Link from 'next/link'
import { BusinessBrandDetail } from '@components/Forms/BusinessBrandDetail'
import { BrandOverview } from '@components/BrandOverview'
import { Services } from '@components/Service'

interface OnboardingsProps {
  onboardings: Onboarding[]
  onDrop?: () => void
}
const ItemTypes = {
  CARD: 'card'
}
interface OnboardingItemsProps extends Omit<Onboarding, '_id'> {
  id?: any
  index?: number
  moveCard?: (dragIndex: number, hoverIndex: number) => void
  ids?: string[]
  onDrop?: () => void
}
export const Onboarding: React.FC<OnboardingsProps> = ({ onboardings }) => {
  const [cards, { set: setCards }] = useList<any>([])
  const moveCard = useCallback(
    (dragIndex: number, hoverIndex: number) => {
      // if (!cards) return
      const dragCard = cards[dragIndex]

      setCards(
        update(cards, {
          $splice: [
            [dragIndex, 1],
            [hoverIndex, 0, dragCard]
          ]
        })
      )
    },
    [cards]
  )

  const ids = useMemo(() => {
    return cards?.map((v: any) => v?._id)
  }, [cards])

  const renderCard = (index: number, onboarding: any, ids: number[], onDrop?: () => void) => {
    return (
      <OnboardingItem
        key={index}
        index={index}
        id={onboarding?._id}
        moveCard={moveCard}
        ids={ids}
        onDrop={onDrop}
        {...onboarding}
      />
    )
  }
  useEffect(() => {
    if (onboardings) {
      setCards(onboardings)
    }
  }, [onboardings])
  return <>{cards?.map((chapter: any, i: number) => renderCard(i, chapter, ids))}</>
}

export const OnboardingItem: React.FC<OnboardingItemsProps> = ({ id, ids, index, moveCard, onDrop, ...onboarding }) => {
  const ref = useRef<HTMLDivElement>(null)

  const handleDeleteOnboarding = async () => {
    try {
      const confirmation = await confirm('Are you sure you want to delete this item?')
      if (!confirmation) {
        return
      }
      mutate?.(GET_ONBOARDINGS_ITEM)
      await deleteOnboardingItem(id)
    } catch (error: any) {
      console.log(error)
      toast.error(error?.message || 'Something went wrong')
    }
  }
  const [{ handlerId }, drop] = useDrop({
    accept: ItemTypes.CARD,
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId()
      }
    },
    drop() {
      if (!ids) return
      updateOrder(ids)
      onDrop?.()
    },
    hover(item: any, monitor: DropTargetMonitor) {
      if (!ref.current) {
        return
      }
      const dragIndex = item?.index
      const hoverIndex = index || 0

      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return
      }

      // Determine rectangle on screen
      const hoverBoundingRect = ref.current?.getBoundingClientRect()

      // Get vertical middle
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2

      // Determine mouse position
      const clientOffset = monitor.getClientOffset()

      // Get pixels to the top
      const hoverClientY = (clientOffset as XYCoord).y - hoverBoundingRect.top

      // Only perform the move when the mouse has crossed half of the items height
      // When dragging downwards, only move when the cursor is below 50%
      // When dragging upwards, only move when the cursor is above 50%

      // Dragging downwards
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return
      }

      // Dragging upwards
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return
      }

      // Time to actually perform the action
      moveCard?.(dragIndex, hoverIndex)

      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      item.index = hoverIndex
    }
  })
  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.CARD,
    item: () => {
      return { id, index }
    },
    collect: (monitor: any) => ({
      isDragging: monitor.isDragging()
    })
  })

  const opacity = isDragging ? 0 : 1
  drag(drop(ref))
  return (
    <div style={{ opacity }} data-handler-id={handlerId}>
      <Disclosure as="div" ref={ref} className="p-5 rounded-lg bg-dark">
        {({ open }) => (
          /* Use the `open` state to conditionally change the direction of an icon. */
          <>
            <Disclosure.Button as="div" className="flex items-center justify-between w-full">
              <div className="flex items-center space-x-4">
                <button className="cursor-move">
                  <MdDragHandle />
                </button>
                <span
                  className={clsx(
                    'flex items-center justify-center text-black rounded-full w-9 h-9 text-xl font-bold',
                    open ? 'bg-primary' : 'bg-lightGray'
                  )}>
                  {Number(index) + 1}
                </span>
                <h1 className="text-xl text-white">{onboarding.title}</h1>
              </div>
              <div className="flex items-center space-x-3">
                <Link href={`/admin/onboarding/${id}`}>
                  <a>
                    <MdEdit />
                  </a>
                </Link>
                <button className="text-danger" onClick={handleDeleteOnboarding}>
                  <MdDelete />
                </button>
                <MdChevronLeft className={clsx('transform text-2xl cursor-pointer', open ? 'rotate-90' : '-rotate-90')} />
              </div>
            </Disclosure.Button>
            <Disclosure.Panel className="flex flex-col mt-4 space-y-4">
              <div dangerouslySetInnerHTML={{ __html: onboarding?.content }} />
              {onboarding?.videoAttachment?.url && (
                <div className="w-1/2">
                  <VideoPlayer src={onboarding?.videoAttachment?.url} />
                </div>
              )}
              {onboarding?.renderFeature && (
                <div className="p-5 rounded-lg bg-secondary">
                  {onboarding?.renderFeature === 'brand-overview' && <BrandOverview />}
                  {onboarding?.renderFeature === 'pricing' && <Services hidePurchases />}
                </div>
              )}
              {onboarding?.mapFields && (
                <div className="p-5 rounded-lg bg-secondary">
                  {onboarding?.mapFields === 'social-access' && <AddSocialCompact hideSubmit />}
                  {onboarding?.mapFields === 'brand-overview' && <BusinessBrandDetail />}
                </div>
              )}
            </Disclosure.Panel>
          </>
        )}
      </Disclosure>
    </div>
  )
}
