import { getUserByNfts } from '@src/restapi/users/mutation'
import { fetchNftIdsFromAddress } from '@utils/index'
import { getUserData } from '@utils/lib/fetchBalance'
import { useEffect, useState } from 'react'
export const useBusinessInNFT = (nftId?: string) => {
  const [nfts, setNfts] = useState<any[]>([])
  const [address, setAddress] = useState(null)

  useEffect(() => {
    if (!nftId) return
    getUserData(nftId).then(({ address }) => setAddress(address))
  }, [nftId])
  useEffect(() => {
    if (address) {
      fetchNftIdsFromAddress(address).then((nftIds) => {
        const nft = nftIds.map((nftId: any) => Number(nftId))
        getUserByNfts(nft).then(({ data }) => {
          setNfts(data)
        })
      })
    }
  }, [address])
  return nfts
}
