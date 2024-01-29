import { Formik } from 'formik'
import { MdAdd, MdChevronLeft, MdDelete, MdSave } from 'react-icons/md'
import Button, { Variants } from '@components/Button'
import { Input } from '../../components/Input'
import { editOnboardingItemSchema } from './schema'
import { toast } from 'react-toastify'
import dynamic from 'next/dynamic'
import { TextEditorProps } from '@components/Forms/components/TextEditor'
import { useEffect, useMemo, useState } from 'react'
import { Disclosure } from '@headlessui/react'
import clsx from 'clsx'
import { useToggle } from 'react-use'
import { Dropzone, SingleSelect } from '@components/Forms/components'
import { confirm } from '@components/ConfirmationBox'
import { editOnboardingItem } from '@src/restapi/onboardings/mutation'
import { useRouter } from 'next/router'
import useSWR from 'swr'
import { GET_ONBOARDINGS_ITEM } from '@src/restapi/onboardings/constants'

const TextEditor = dynamic<TextEditorProps>(
  () => import('@components/Forms/components/TextEditor').then((mod) => mod.TextEditor),
  {
    ssr: false
  }
)

type ActionTypes = {
  type: 'mark-as-complete' | 'mark-as-skip' | 'plain-url' | 'finalize'
  text?: string
  theme?: Variants
  url?: string
}
const defaultActions: ActionTypes[] = [
  {
    type: 'mark-as-complete',
    text: 'Mark as complete',
    theme: 'primary',
    url: ''
  }
]
const themeList = [
  {
    label: 'Primary',
    value: 'primary'
  },
  {
    label: 'Secondary',
    value: 'secondary'
  },
  {
    label: 'Dark',
    value: 'dark'
  },
  {
    label: 'Outline',
    value: 'outline'
  },
  {
    label: 'None',
    value: 'none'
  },
  {
    label: 'Success',
    value: 'success'
  },
  {
    label: 'Danger',
    value: 'danger'
  }
]

const typeList = [
  {
    label: 'Mark as complete',
    value: 'mark-as-complete'
  },
  {
    label: 'Mark as skip',
    value: 'mark-as-skip'
  },
  {
    label: 'Plain URL',
    value: 'plain-url'
  },
  {
    label: 'Finalize',
    value: 'finalize'
  }
]
const availableFieldList = [
  {
    label: 'None',
    value: 'none'
  },
  {
    label: 'Social Access',
    value: 'social-access'
  }
  // {
  //   label: 'Brand Overview',
  //   value: 'brand-overview'
  // }
]
const availableFeatureList = [
  {
    label: 'None',
    value: 'none'
  },
  {
    label: 'Brand Overview',
    value: 'brand-overview'
  },
  {
    label: 'Pricing',
    value: 'pricing'
  }
]
const initialActionValues = {
  type: 'mark-as-complete',
  text: '',
  theme: 'primary',
  url: ''
} as const

export const EditOnboardingItemForm: React.FC = () => {
  const router = useRouter()
  const id = router.query.id as string

  const [actions, setActions] = useState<ActionTypes[]>(defaultActions)
  const [addingAction, setAddingAction] = useToggle(false)
  const [actionValues, setActionValues] = useState<ActionTypes>(initialActionValues)

  const { data } = useSWR<RestApi.Response<Onboarding>>(id ? `${GET_ONBOARDINGS_ITEM}/${id}` : null)

  const handleAddAction = () => {
    setActions([...actions, actionValues])
    setAddingAction(false)
    setActionValues(initialActionValues)
  }

  const handledeleteAction = async (index: number) => {
    const confirmation = await confirm('Are you sure you want to delete this action?')
    if (confirmation) {
      const newActions = [...actions]
      newActions.splice(index, 1)
      setActions(newActions)
    }
  }

  const handleEditOnboardingItem = async (values: Record<string, any>) => {
    try {
      // remove undefined object value from values
      Object.keys(values).forEach((key) => values[key] === undefined && delete values[key])
      if (values.mapFields === 'none') {
        values.mapFields = ''
      }
      if (values.renderFeature === 'none') {
        values.renderFeature = ''
      }
      const body = {
        ...values,
        actions
      }

      const data = await editOnboardingItem(id, body)
      if (data?.status === 200) {
        toast.success(data?.message)
        router.push('/admin/onboarding')
        return values
      } else {
        toast.error(data?.message)
      }
    } catch (e: any) {
      toast.error(e?.message)
    }
  }

  const initialFormValues = useMemo(() => {
    const value = data?.data
    return {
      title: value?.title,
      content: value?.content,
      videoAttachment: value?.videoAttachment,
      mapFields: value?.mapFields,
      renderFeature: value?.renderFeature,
      actions: value?.actions
    }
  }, [data?.data])

  useEffect(() => {
    if (data?.data?.actions) {
      setActions(data?.data?.actions)
    }
  }, [data?.data])
  return (
    <Formik
      initialValues={initialFormValues}
      onSubmit={handleEditOnboardingItem}
      validationSchema={editOnboardingItemSchema}
      enableReinitialize>
      {({ values, handleChange, handleBlur, handleSubmit, errors, isSubmitting, setFieldValue }) => (
        <form onSubmit={handleSubmit} className="flex flex-col space-y-3">
          <Input
            label="Title"
            placeholder="Title"
            name="title"
            onChange={handleChange}
            onBlur={handleBlur}
            value={values?.title}
            error={errors?.title}
            required
          />
          <TextEditor label="Content" name="content" setFieldValue={setFieldValue} value={values?.content} required />
          <Dropzone
            label="Video Attachment"
            accept={{
              'video/*': ['.mp4', '.mpeg', '.mkv', '.webm']
            }}
            multiple={false}
            maxFileSize={100000000}
            setFieldValue={setFieldValue}
            name="videoAttachment"
            value={values?.videoAttachment?._id}
            current={values?.videoAttachment?.url}
          />
          <SingleSelect
            label="Map Fields"
            items={availableFieldList}
            value={values?.mapFields}
            setFieldValue={setFieldValue}
            name="mapFields"
            hint="Ignore if not necessary. Display a form based on value."
          />
          <SingleSelect
            label="Choose Feature"
            items={availableFeatureList}
            value={values?.renderFeature}
            setFieldValue={setFieldValue}
            name="renderFeature"
            hint="Ignore if not necessary. Display a feature based on value."
          />

          <div>
            <label className="text-sm font-light text-left">Actions</label>
            <div className="flex flex-col my-3 space-y-2">
              {actions?.map((action, index) => (
                <div key={index} className="flex w-full space-x-3">
                  <Disclosure as="div" className="w-full px-5 py-3 rounded-md bg-dark">
                    {({ open }) => (
                      <>
                        <Disclosure.Button className="flex items-center justify-between w-full">
                          <span>
                            {action?.text} <small className="text-white text-opacity-70">({action.type})</small>
                          </span>
                          <MdChevronLeft className={clsx('transform', open ? 'rotate-90' : '-rotate-90')} />
                        </Disclosure.Button>
                        <Disclosure.Panel className="py-3">
                          <span className="block mb-2 text-sm text-white text-opacity-80">Preview</span>
                          <Button variant={action?.theme}>
                            <span>{action?.text}</span>
                          </Button>
                        </Disclosure.Panel>
                      </>
                    )}
                  </Disclosure>
                  <button
                    type="button"
                    onClick={() => handledeleteAction(index)}
                    className="flex justify-center mt-3 text-lg text-danger">
                    <MdDelete />
                  </button>
                </div>
              ))}
            </div>
            {!addingAction && (
              <Button className="flex items-center px-0 py-0 space-x-2" size="sm" variant="none" onClick={setAddingAction}>
                <MdAdd />
                <span>Add Action</span>
              </Button>
            )}
            {addingAction && (
              <div className="px-5 py-3 border-l border-gray-700">
                <div className="flex w-full space-x-3">
                  <Input
                    label="Text"
                    containerClass="flex-1"
                    value={actionValues.text}
                    onChange={(evt) =>
                      setActionValues({
                        ...actionValues,
                        text: evt.currentTarget?.value
                      })
                    }
                  />
                  <SingleSelect
                    label="Theme"
                    items={themeList}
                    className="w-64"
                    value={actionValues.theme}
                    onChange={(v) =>
                      setActionValues({
                        ...actionValues,
                        theme: v
                      })
                    }
                  />
                  <SingleSelect
                    label="Type"
                    items={typeList}
                    className="w-64"
                    value={actionValues.type}
                    onChange={(v) =>
                      setActionValues({
                        ...actionValues,
                        type: v
                      })
                    }
                  />
                  {actionValues.type === 'plain-url' && (
                    <Input
                      label="URL"
                      containerClass="flex-1"
                      value={actionValues.url || ''}
                      onChange={(evt) =>
                        setActionValues({
                          ...actionValues,
                          url: evt.currentTarget?.value
                        })
                      }
                    />
                  )}
                </div>
                <div className="flex items-center mt-3 space-x-3">
                  <Button
                    className="flex items-center px-0 py-0 space-x-2 hover:underline"
                    size="sm"
                    variant="none"
                    onClick={handleAddAction}>
                    <MdAdd />
                    <span>Add Action</span>
                  </Button>
                  <Button
                    className="px-0 py-0 hover:underline"
                    size="sm"
                    variant="none"
                    onClick={() => setAddingAction(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
          <div>
            <Button type="submit" variant="outline" size="sm" className="flex items-center space-x-2" loading={isSubmitting}>
              <MdSave />
              <span>Save</span>
            </Button>
          </div>
        </form>
      )}
    </Formik>
  )
}
