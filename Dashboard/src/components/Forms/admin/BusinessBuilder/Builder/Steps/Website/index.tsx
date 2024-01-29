import { Formik } from 'formik'
import { useMemo, useState } from 'react'
import { MdContentCopy } from 'react-icons/md'
import { toast } from 'react-toastify'
import { useCopyToClipboard } from 'react-use'

import Button from '@components/Button'
import { Input } from '@components/Forms/components/Input'

import { websiteGenerateSchema } from './schema'
import { useRouter } from 'next/router'
import { useBusiness } from '@hooks/useBusiness'
import { UpdateBusinessDto } from '@src/restapi/businesses/business'
import Link from 'next/link'
import { SelectUsers } from '@components/Forms/SelectUsers'
import clsx from 'clsx'

interface WebsiteGenerateProps {
  onNext?: (nextStepIndex: number, data?: UpdateBusinessDto) => Promise<any>
}
type Selection = {
  label: string
  value: string
}
export const WebsiteGenerate: React.FC<WebsiteGenerateProps> = ({ onNext }) => {
  const [state, copyToClipboard] = useCopyToClipboard()
  const { query, push } = useRouter()
  const businessId = query?.businessId as string
  const { data } = useBusiness(businessId)
  const [selectedUser, setSelectedUser] = useState<Selection>()

  const handleCopyToClipboard = (value: string) => {
    copyToClipboard(value)
    if (!state.error) {
      toast.success('Copied to clipboard')
    }
  }

  const handleSelectUser = (
    user: Selection & {
      hasEmail?: boolean
    }
  ) => {
    if (!user?.hasEmail) {
      toast.error('User does not have an email address, click here to add one', {
        onClick: () => push(`/admin/settings/${user?.value}`),
        autoClose: 20000
      })
      return
    }
    setSelectedUser(user)
  }

  const formInitialValues = useMemo(() => {
    // TODO add initial values from API or kept empty
    return {
      domain: data?.data?.domain,
      accounts: {
        email: {
          email: data?.data?.accounts?.email?.email,
          password: data?.data?.accounts?.email?.password,
          nftId: data?.data?.accounts?.email?.nftId
        }
      }
    }
  }, [data])
  const handleWebsiteGenerateProcess = async (values: Record<string, any>) => {
    if (data?.data?.generated) {
      toast.error('Website is already generated')
      return
    }
    const manualInput = values?.accounts?.email?.nftId || values?.accounts?.email?.email || values?.accounts?.email?.password
    const user = selectedUser?.value
    if (user && !manualInput) {
      values.user = user
      delete values.accounts
      delete values.accounts
    }
    return await onNext?.(4, values)
  }

  return (
    <div>
      <Formik
        initialValues={formInitialValues}
        onSubmit={handleWebsiteGenerateProcess}
        validationSchema={websiteGenerateSchema}
        enableReinitialize>
        {({ values, handleChange, handleBlur, handleSubmit, errors, isSubmitting }) => (
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col mb-5 space-y-3">
              <Input
                label="Website Domain"
                name="domain"
                placeholder="husl.xyz"
                onChange={handleChange}
                onBlur={handleBlur}
                value={values?.domain}
                error={errors?.domain}
                required
              />
              {/* Domain DNS */}
              {values?.domain && !errors?.domain && (
                <div className="flex flex-col space-y-1">
                  <span className="text-sm">Add records below in your domain provider's DNS settings</span>
                  <div className="px-5 py-2 border border-gray-500 rounded-lg">
                    <div className="flex space-y-1">
                      <table className="flex-1">
                        <tbody>
                          <tr>
                            <td className="pr-2">Type</td>
                            <td className="pr-2">Host</td>
                            <td className="pr-2">Value</td>
                            <td className="pr-2">TTL</td>
                          </tr>
                          <tr>
                            <td className="pr-2">A</td>
                            <td className="pr-2">@</td>
                            <td className="pr-2">5.254.43.186</td>
                            <td className="pr-2">Automatic</td>
                          </tr>
                        </tbody>
                      </table>
                      {/* copy value to clipboard */}
                      <button onClick={() => handleCopyToClipboard('5.254.43.186')}>
                        <MdContentCopy />
                      </button>
                    </div>
                  </div>
                  <a href="https://account.godaddy.com/products" target="_blank">
                    <span className="text-sm underline hover:text-primary">Sign in to GoDaddy</span>
                  </a>
                </div>
              )}
              <>
                {data?.data?.user?._id ? (
                  <Input
                    type="text"
                    label="Associated Account (Generated)"
                    // name="accounts.email.email"
                    // onChange={handleChange}
                    // onBlur={handleBlur}
                    value={data?.data?.user?.name || data?.data?.user?.email || data?.data?._id}
                    // error={(errors as any)?.email}
                    disabled
                    hint={
                      <span>
                        You can't edit this here.{' '}
                        <Link href={`/admin/accounts?email=${data?.data?.user?.email}`}>
                          <a className="underline text-primary" target="blank" rel="follow">
                            See generated account
                          </a>
                        </Link>
                      </span>
                    }
                  />
                ) : (
                  <div className="flex flex-col space-y-3">
                    {!selectedUser?.value && (
                      <>
                        <Input
                          type="text"
                          label="NFT ID"
                          name="accounts.email.nftId"
                          onChange={handleChange}
                          onBlur={handleBlur}
                          value={values?.accounts?.email?.nftId}
                          error={(errors as any)?.nftId}
                          autoComplete="off"
                          required
                        />
                        <Input
                          type="email"
                          label="Email Address"
                          name="accounts.email.email"
                          onChange={handleChange}
                          onBlur={handleBlur}
                          value={values?.accounts?.email?.email}
                          error={(errors as any)?.email}
                          autoComplete="off"
                          required
                        />
                        <Input
                          type="password"
                          label="Password"
                          name="accounts.email.password"
                          onChange={handleChange}
                          onBlur={handleBlur}
                          value={values?.accounts?.email?.password}
                          error={(errors as any)?.password}
                          autoComplete="off"
                          required
                        />
                      </>
                    )}

                    <div
                      className={clsx(
                        !values?.accounts?.email?.nftId &&
                          !values?.accounts?.email?.email &&
                          !values?.accounts?.email?.password
                          ? ''
                          : 'hidden'
                      )}>
                      <span className="block mb-3 text-sm">Or choose existing account</span>
                      <SelectUsers label="Choose Existing Account" name="user" isMulti={false} onChange={handleSelectUser} />
                    </div>
                  </div>
                )}
              </>
            </div>
            <div className="flex items-center space-x-3">
              <Button type="submit" text="Save & Continue" disabled={data?.data?.generated} loading={isSubmitting} />
            </div>
          </form>
        )}
      </Formik>
    </div>
  )
}
