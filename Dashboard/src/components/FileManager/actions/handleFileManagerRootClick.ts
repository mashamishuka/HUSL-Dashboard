import { MouseEvent } from 'react'
import { confirmable, createConfirmation } from 'react-confirm'
import { RootOptionsDropdown } from '../Misc'

export const handleFileManagerRootClick = async (evt: MouseEvent<HTMLElement>) => {
  evt.preventDefault()
  evt.stopPropagation()

  await createConfirmation(confirmable(RootOptionsDropdown))({
    style: {
      position: 'fixed',
      top: evt.clientY,
      left: evt.clientX
    }
  })
}
