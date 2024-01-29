import clsx from 'clsx'

import { CheckIcon } from '@heroicons/react/20/solid'

interface StepTimelineProps {
  currentKey?: string
  steps?: Record<string, any>[]
  onStepClick?: (key: string) => void
}
export const StepTimeline: React.FC<StepTimelineProps> = ({ steps, currentKey, onStepClick }) => {
  return (
    <nav className=" w-42" aria-label="Progress">
      <ol role="list" className="overflow-hidden">
        {steps?.map((step, stepIdx) => (
          <li key={step.name} className={clsx(stepIdx !== steps.length - 1 ? 'pb-10' : '', 'relative')}>
            {step.status === 'completed' ? (
              <>
                {stepIdx !== steps.length - 1 ? (
                  <div className="absolute h-full -ml-px bg-primary top-4 left-3 mt-0.5 w-0.5" aria-hidden="true" />
                ) : null}
                <button onClick={() => onStepClick?.(step?.key)} className="relative flex items-center space-x-2 group">
                  <span className="flex items-center h-8">
                    <span className="relative z-10 flex items-center justify-center w-6 h-6 rounded-full bg-primary">
                      <CheckIcon className="w-4 h-4 text-white" aria-hidden="true" />
                    </span>
                  </span>
                  <span className="text-sm font-medium">{step.name}</span>
                </button>
              </>
            ) : step.key === currentKey ? (
              <>
                {stepIdx !== steps.length - 1 ? (
                  <div className="absolute h-full -ml-px bg-gray-300 top-4 left-3 mt-0.5 w-0.5" aria-hidden="true" />
                ) : null}
                <button
                  onClick={() => onStepClick?.(step?.key)}
                  className="relative flex items-center space-x-2 group"
                  aria-current="step">
                  <span className="flex items-center h-8" aria-hidden="true">
                    <span className="relative z-10 flex items-center justify-center w-6 h-6 bg-white border-2 rounded-full border-primary">
                      <span className="w-2 h-2 rounded-full bg-primary" />
                    </span>
                  </span>
                  <span className="text-sm font-medium text-primary">{step.name}</span>
                </button>
              </>
            ) : (
              <>
                {stepIdx !== steps.length - 1 ? (
                  <div className="absolute h-full -ml-px bg-gray-300 top-4 left-3 mt-0.5 w-0.5" aria-hidden="true" />
                ) : null}
                <button onClick={() => onStepClick?.(step?.key)} className="relative flex items-center space-x-2 group">
                  <span className="flex items-center h-8" aria-hidden="true">
                    <span className="relative z-10 flex items-center justify-center w-6 h-6 bg-white border-2 rounded-full border-primary">
                      <span className="w-2 h-2 bg-transparent rounded-full group-hover:bg-primary group-hover:opacity-50" />
                    </span>
                  </span>
                  <span className="text-sm font-medium text-gray-300">{step.name}</span>
                </button>
              </>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}
