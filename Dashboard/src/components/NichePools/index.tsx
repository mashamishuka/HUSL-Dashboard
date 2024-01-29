import Button from '@components/Button'
import clsx from 'clsx'
import { MdAdd } from 'react-icons/md'
import { useToggle } from 'react-use'
import { LeadList } from './LeadList'
import { useMemo, useState } from 'react'
import { ScriptList } from './Scripts'
import { AddNicheScript } from '@components/Modals/AddNicheScript'

export const NichePools: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('leads')
  const [scriptModal, setScriptModal] = useToggle(false)

  const tabs = useMemo(() => {
    return [
      { name: 'Leads', href: '#', key: 'leads' },
      { name: 'Scripts', href: '#', key: 'scripts' }
    ]
  }, [])
  return (
    <div>
      <div className="mb-5">
        <nav className="flex space-x-4" aria-label="Tabs">
          {tabs.map((tab, i) => (
            <button
              key={i}
              className={clsx(
                tab?.key === activeTab ? 'bg-dark' : 'text-gray-300 hover:text-gray-400',
                'rounded-md px-3 py-2 font-medium'
              )}
              onClick={() => setActiveTab(tab.key)}
              aria-current={tab?.key === activeTab ? 'page' : undefined}>
              {tab.name}
            </button>
          ))}
        </nav>
      </div>
      {activeTab === 'leads' && (
        <div>
          <div className="mt-5">
            <LeadList />
          </div>
        </div>
      )}
      {activeTab === 'scripts' && (
        <div>
          <Button className="flex items-center space-x-2" onClick={() => setScriptModal(true)}>
            <MdAdd className="text-lg" />
            <span>Add Scripts</span>
          </Button>
          <div className="mt-5">
            <ScriptList />
          </div>
          <AddNicheScript show={scriptModal} onClose={() => setScriptModal(false)} />
        </div>
      )}
    </div>
  )
}
