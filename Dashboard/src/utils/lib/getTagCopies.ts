import { Business } from '@src/restapi/businesses/business'

export const getTagCopies = (business?: Business) => {
  const tagCopy = business?.niche?.tagCopy
  const copyFrom: any = tagCopy?.map((v) => v.key)
  const copyTo: any = tagCopy?.map((v) => v.value)
  // this is default copy, you might want to make it dynamic
  copyFrom?.push(
    '[niche]',
    '[company]',
    '[primary color]',
    '[secondary color]',
    '[logo]',
    '[favicon]',
    '[domain]',
    '[product url]',
    '[url]',
    '[pain point]'
  )
  copyTo?.push(
    business?.niche?.name?.toString(),
    business?.name,
    business?.primaryColor,
    business?.secondaryColor,
    business?.logo?.url,
    business?.favicon?.url,
    business?.domain,
    business?.user?.productUrl,
    business?.domain,
    business?.niche?.tagCopy?.find((p) => p.key === '[pain-point]')?.value?.toString()
  )
  return { copyFrom, copyTo }
}
