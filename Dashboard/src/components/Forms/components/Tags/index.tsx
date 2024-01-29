import { useMemo, useState, useEffect } from 'react'
import clsx from 'clsx'
import { WithContext as ReactTags } from 'react-tag-input'

export interface SelectionProps {
  className?: string
  label?: string
  hint?: string
  variant?: 'default' | 'error' | 'success' | 'dark'
  required?: boolean
  setFieldValue?: (field?: any, name?: any, shouldValidate?: boolean) => void
  name?: string
  values?: string[]
}
const KeyCodes = {
  comma: 188,
  enter: 13
}
type tagProps = {
  id: string
  text: string
}
export const Tags: React.FC<SelectionProps> = ({
  hint,
  variant,
  label,
  required,
  name,
  setFieldValue,
  values,
  ...props
}) => {
  const [tags, setTags] = useState<tagProps[] | undefined>()

  const handleDelete = (i: number) => {
    const tag = tags?.filter((_, index) => index !== i)
    setTags(tag)
    const values = tag?.map((tag) => tag.text)
    setFieldValue?.(name, values)
  }

  const handleAddition = (tag: any) => {
    let values = []
    if (tags && tags?.length > 0) {
      values = [...tags, tag]
    } else {
      values = [tag]
    }
    setTags(values)
    values = values.map((tag) => tag.text)
    setFieldValue?.(name, values)
  }

  const handleDrag = (tag: any, currPos: number, newPos: number) => {
    const newTags = tags?.slice()

    newTags?.splice(currPos, 1)
    newTags?.splice(newPos, 0, tag)

    // re-render
    setTags(newTags)
  }

  const handleTagClick = (index: number) => {
    console.log('The tag at index ' + index + ' was clicked')
  }

  const theme = useMemo(() => {
    let className = {
      labelColor: 'text-white',
      hintColor: 'text-white',
      borderColor: 'border-white border-opacity-40'
    }
    switch (variant) {
      case 'error':
        className = {
          labelColor: 'text-danger',
          hintColor: 'text-danger',
          borderColor: 'border-danger'
        }
        break
      case 'success':
        className = {
          labelColor: 'text-success',
          hintColor: 'text-success',
          borderColor: 'border-success'
        }
        break
      case 'dark':
        className = {
          labelColor: 'text-white',
          hintColor: 'text-gray-400',
          borderColor: 'border-secondary'
        }
        break
      default:
        break
    }
    return className
  }, [variant])

  // useEffect(() => {
  //   const values = tags?.map((tag) => tag.text)
  //   setFieldValue?.(name, values)
  // }, [tags])
  useEffect(() => {
    if (values) {
      const tags = values.map((value) => {
        return {
          id: value,
          text: value
        }
      })
      setTags(tags)
    }
  }, [values])
  return (
    <div className="flex flex-col">
      {label && (
        <label className={clsx('text-sm font-light mb-2', theme.labelColor)}>
          {label} {required && <span className="text-danger">*</span>}
        </label>
      )}
      <ReactTags
        tags={tags as any}
        delimiters={[KeyCodes.comma, KeyCodes.enter]}
        handleDelete={handleDelete}
        handleAddition={handleAddition}
        handleDrag={handleDrag}
        handleTagClick={handleTagClick}
        inputFieldPosition="bottom"
        autocomplete
        {...props}
      />
      {hint && <span className={clsx('text-xs', theme.hintColor)}>{hint}</span>}
    </div>
  )
}
