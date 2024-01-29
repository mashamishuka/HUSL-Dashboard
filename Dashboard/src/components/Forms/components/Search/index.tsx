import { HTMLProps } from 'react'

// import { Search as SearchIcon } from '@components/Icons'
// import clsx from 'clsx'
import * as Icon from '@components/Icons'

import { getAlgoliaResults } from '@algolia/autocomplete-js'
import algoliasearch from 'algoliasearch'
import { Autocomplete } from '@components/Forms/components/Autocomplete'

const appId = 'J6PXE72V58'
const apiKey = 'e88a1d79654a997d96a6fe06164ebdd2'
const searchClient = algoliasearch(appId, apiKey)

export function SearchItem({ hit, components }: any) {
  const ItemIcon = (Icon as any)?.[hit.icon] ? (Icon as any)[hit.icon] : Icon.Search
  return (
    <a href={hit.url} className="aa-ItemLink">
      <div className="flex items-center py-2 space-x-3 border-b border-gray-700 aa-ItemContent">
        <div className="aa-ItemIcon">
          <ItemIcon size={14} />
        </div>
        <div className="aa-ItemTitle">
          <components.Highlight hit={hit} attribute="name" />
        </div>
      </div>
    </a>
  )
}

interface SearchProps extends HTMLProps<HTMLInputElement> {
  placeholder?: string
  loading?: boolean
  loadingText?: string
  iconSize?: number
  className?: string
}
export const Search: React.FC<SearchProps> = () => {
  return (
    <div>
      {/* <label className="relative">
        {loading ? (
          <input
            type="text"
            className={clsx(
              'w-full py-3 pl-14 pr-4 border-0 rounded-3xl bg-[#222] focus-within:border-transparent focus:ring-0 placeholder:font-light placeholder:text-white placeholder:text-opacity-50',
              className
            )}
            placeholder={placeholder}
            value={loadingText}
            {...rest}
          />
        ) : (
          <input
            type="text"
            className={clsx(
              'w-full py-3 pl-14 pr-4 border-0 rounded-3xl bg-[#222] focus-within:border-transparent focus:ring-0 placeholder:font-light placeholder:text-white placeholder:text-opacity-50',
              className
            )}
            placeholder={placeholder}
            value={value}
            onChange={(evt) => setValue(evt.target.value)}
            name={name}
            {...rest}
          />
        )}
        <span className={clsx('absolute text-white text-opacity-50 transform -translate-y-1/2 top-1/2 left-5')}>
          <SearchIcon size={iconSize} />
        </span>
      </label> */}
      <Autocomplete
        // openOnFocus={true}
        placeholder="Search..."
        getSources={({ query }: any) => [
          {
            sourceId: 'products',
            getItems() {
              return getAlgoliaResults({
                searchClient,
                queries: [
                  {
                    indexName: 'dev_HUSL',
                    query
                  }
                ]
              })
            },
            templates: {
              item({ item, components }: any) {
                return <SearchItem hit={item} components={components} />
              }
            }
          }
        ]}
      />
    </div>
  )
}
