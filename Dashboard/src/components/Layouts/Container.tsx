import clsx from 'clsx'
import { HTMLProps } from 'react'

interface ContainerProps extends HTMLProps<HTMLDivElement> {
  children?: React.ReactNode
}
export const Container: React.FC<ContainerProps> = ({ className, children, ...rest }) => {
  return (
    <div className={clsx('lg:w-11/12 w-full xl:w-[87.5%] mx-auto', className)} {...rest}>
      {children}
    </div>
  )
}
