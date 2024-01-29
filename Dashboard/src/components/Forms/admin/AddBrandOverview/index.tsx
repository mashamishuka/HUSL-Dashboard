import { WarningAlert } from '@components/Alerts'
import Button from '@components/Button'
import { GET_USER_TIPS_N_TRICK } from '@src/restapi/tipsntricks/constants'
import { createUserTipsNTrick } from '@src/restapi/tipsntricks/mutation'
import { TipsNTrick, TipsNTrickItem } from '@src/restapi/tipsntricks/tipsntricks'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { MdAdd, MdDelete, MdSave } from 'react-icons/md'
import { toast } from 'react-toastify'
import { useList } from 'react-use'
import useSWR from 'swr'

const newTnt = {
  title: 'Add title',
  description: 'Add description'
}
export const BrandOverviewForm: React.FC = () => {
  const { query } = useRouter()
  const { data } = useSWR<RestApi.Response<TipsNTrick>>(`${GET_USER_TIPS_N_TRICK}/user/${query?.userId}`)
  const [tnts, { push, removeAt, updateAt, set }] = useList<TipsNTrickItem>([
    {
      title: 'Add title',
      description: 'Add description'
    }
  ])
  const [loading, setLoading] = useState(false)

  const handleSaveTnT = async () => {
    setLoading(true)
    try {
      await createUserTipsNTrick(tnts, query?.userId?.toString())
      toast.success('Brand overview saved.')
    } catch (error) {
      toast.error('Error saving data. Try again later.')
    }
    setLoading(false)
  }

  useEffect(() => {
    if (data?.data?.tipsNtricks) {
      set(data.data?.tipsNtricks)
    }
  }, [data])

  return (
    <div className="flex flex-col space-y-5">
      {(tnts?.length === 0 || !tnts) && (
        <WarningAlert>To create a new Brand Overview, please click Add Item button bellow.</WarningAlert>
      )}
      <div className="flex flex-col space-y-5 divide-y divide-gray-600">
        {tnts?.map((tnt, index) => (
          <div key={index} className="relative flex flex-col pt-5 pr-8 space-y-3 first:-mt-8">
            <div className="flex flex-col">
              <label htmlFor="title" className="text-sm font-light text-left text-opacity-80">
                Title
              </label>
              <input
                type="text"
                name="title"
                id="title"
                className="w-full px-4 py-2 text-sm font-light bg-transparent border rounded-xl focus:outline-none"
                placeholder="Add title..."
                value={tnt?.title}
                onChange={(e) => {
                  updateAt(index, {
                    ...tnt,
                    title: e.target.value
                  })
                }}
              />
            </div>
            <div className="flex flex-col">
              <label htmlFor="description" className="text-sm font-light text-left text-opacity-80">
                Description
              </label>
              <textarea
                name="description"
                id="description"
                className="w-full px-4 py-2 text-sm font-light bg-transparent border rounded-xl focus:outline-none"
                placeholder="Add description..."
                rows={3}
                value={tnt?.description}
                onChange={(e) => {
                  updateAt(index, {
                    ...tnt,
                    description: e.target.value
                  })
                }}
              />
            </div>
            <button
              className="absolute right-0 transform -translate-y-1/2 top-1/2"
              onClick={() => {
                removeAt(index)
              }}>
              <MdDelete />
            </button>
          </div>
        ))}
      </div>
      <div className="flex items-center space-x-3">
        <Button
          size="sm"
          className="flex items-center mt-3 space-x-1"
          variant="outline"
          onClick={() => handleSaveTnT()}
          loading={loading}
          disabled={loading}>
          <MdSave />
          <span>Save Changes</span>
        </Button>
        <Button size="sm" className="flex items-center mt-3 space-x-1" onClick={() => push(newTnt)}>
          <MdAdd />
          <span>Add Item</span>
        </Button>
      </div>
    </div>
  )
}
