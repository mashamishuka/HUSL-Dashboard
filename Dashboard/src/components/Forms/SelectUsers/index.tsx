import { useUsers } from '@hooks/useUser'
import { useMemo } from 'react'
import { Selection, SelectionProps } from '../components/Selects/Selection'

export const SelectUsers: React.FC<SelectionProps> = ({ value, ...props }) => {
  const { data: users } = useUsers()

  const userLists = useMemo(() => {
    if (!users?.data?.length) return []
    const userList = users?.data?.map((user) => ({
      label: user?.name || '',
      value: user?._id || '',
      hasEmail: user?.email ? true : false
    }))
    return userList.filter((u) => !value?.find((v) => v?.value === u?.value))
  }, [users])

  return <Selection items={userLists} value={value} {...props} />
}
