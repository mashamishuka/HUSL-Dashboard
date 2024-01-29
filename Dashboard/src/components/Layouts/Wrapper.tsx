import clsx from 'clsx'
import { HTMLProps } from 'react'

interface WrapperProps extends Omit<HTMLProps<HTMLInputElement>, 'title'> {
  title?: string | JSX.Element
  subtitle?: string | JSX.Element
  actionEl?: string | JSX.Element
}
export const Wrapper: React.FC<WrapperProps> = ({ title, subtitle, className, actionEl, children }) => {
  return (
    <div className={clsx('px-6 py-6 rounded-2xl bg-secondary', className)}>
      {(title || subtitle || actionEl) && (
        <div className="flex flex-col mb-4 space-y-3 md:items-center md:justify-between md:flex-row md:space-y-0">
          <div>
            {title && <h1 className="text-xl">{title}</h1>}
            {subtitle && <span className="text-xs font-light">{subtitle}</span>}
          </div>
          {actionEl && <div className="flex items-center space-x-2">{actionEl}</div>}
        </div>
      )}
      {children}
    </div>
  )
}
