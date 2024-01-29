import { useMemo } from 'react'
import Button from '@components/Button'
import { Formik } from 'formik'
import { MdAdd } from 'react-icons/md'
import { toast } from 'react-toastify'
import useSWR from 'swr'
import { TextArea } from '../components'
import { Input } from '../components/Input'
import { notifyUserSchema } from './schema'
import { GET_USERS } from '@src/restapi/users/constants'
import { Selection } from '../components/Selects/Selection'
import { addNotification } from '@src/restapi/notifications/mutation'

const notifyUserInitial = {
  title: '',
  content: '',
  user_ids: [],
  is_scheduled: false
}
interface NotifyUserFormProps {
  onClose: () => void
  onSubmit: (data: any) => void
}

export const NotifyUserForm: React.FC<NotifyUserFormProps> = ({ onClose, onSubmit: emitNotify }) => {
  const { data: users } = useSWR<RestApi.Response<any[]>>(GET_USERS)

  const handleNotifyUser = async (values: Record<string, any>) => {
    try {
      const formData: FormData = new FormData()
      const data: Record<string, any> = {
        ...values
      }

      for (const key in data) {
        formData.append(key, data[key])
      }
      for (let i = 0; i < data.user_ids.length; i++) {
        const res = await addNotification({
          name: data.user_ids[i],
          title: data.title,
          content: data.content,
          status: false,
          type: 'admin',
          createdAt: Date.now()
        })
        emitNotify(res.data)
      }
      toast.success('Notification was sent successfully.')
      onClose()
    } catch (e: any) {
      console.log(e)
      toast.error(e?.message)
    }
  }

  const usersOptions = useMemo(() => {
    if (users && users?.data.length > 0) {
      const items = users?.data.map((item) => ({
        label: item.name,
        value: item._id?.toString()
      }))
      return items.slice().sort((a, b) => {
        const labelA = a.label.toLowerCase()
        const labelB = b.label.toLowerCase()
        if (labelA < labelB) {
          return -1
        } else if (labelA > labelB) {
          return 1
        } else {
          return 0
        }
      })
    } else {
      return []
    }
  }, [users?.status])

  return (
    <div>
      <Formik initialValues={notifyUserInitial} onSubmit={handleNotifyUser} validationSchema={notifyUserSchema}>
        {({ values, handleChange, handleBlur, handleSubmit, errors, isSubmitting, setFieldValue }) => (
          <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
            <Input
              label="Title"
              placeholder="Notification Title"
              name="title"
              onChange={handleChange}
              onBlur={handleBlur}
              value={values?.title}
              error={errors?.title}
              required
            />
            {
              <Selection
                label="Users"
                name="user_ids"
                variant={'default'}
                hint={values?.user_ids?.length === 0 ? 'Please choose a user' : ''}
                setFieldValue={(field, value) => setFieldValue(field, value)}
                items={usersOptions}
              />
            }
            <TextArea
              label="Content"
              placeholder="Write Content"
              name="content"
              onChange={handleChange}
              onBlur={handleBlur}
              value={values?.content}
              error={errors?.content}
              required
            />
            {/* coming soon */}
            {/* <div className="flex flex-col space-y-1">
              <label className="text-sm font-light text-left">Is Scheduled</label>
              <Toggler onSwitch={(state) => setFieldValue('is_scheduled', state)} />
            </div> */}
            <div className="flex flex-col items-start space-y-3 lg:items-center md:space-x-3 md:flex-row md:space-y-0">
              <Button
                type="submit"
                variant="outline"
                rounded="xl"
                className="flex items-center px-6 py-4 space-x-1 font-light"
                loading={isSubmitting}>
                <MdAdd />
                <span>Add notification</span>
              </Button>
            </div>
          </form>
        )}
      </Formik>
    </div>
  )
}
