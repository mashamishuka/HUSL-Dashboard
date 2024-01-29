import { ethers } from 'ethers';
import { Model } from 'mongoose';
import { UsersService } from 'src/users/users.service';

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';

import { Payout } from './payouts.schema';

const rpc_node =
  'https://mainnet.infura.io/v3/d044127f59224a2aa4d6e258b0551402';
const provider = new ethers.providers.JsonRpcProvider(rpc_node);

const ABI_ERC721 = [
  'function balanceOf(address _owner) external view returns (uint256)',
  'function ownerOf(uint256 _tokenId) external view returns (address)',
  'function getIDsByOwner(address owner) external view returns (uint256[] memory)',
];

const ADDRESS_BUSINESS_NFT = '0x4cB1420AA77B731acbe258F8CA0f0b9ad4aDbD09';
const ADDRESS_FOUNDERCARDS = '0xbbeb904272fa9888c50da37d16b9099fcae78244';

const contract_business_nft = new ethers.Contract(
  ADDRESS_BUSINESS_NFT,
  ABI_ERC721,
  provider,
);

const contract_foundercards = new ethers.Contract(
  ADDRESS_FOUNDERCARDS,
  ABI_ERC721,
  provider,
);

@Injectable()
export class PayoutsService {
  constructor(
    @InjectModel(Payout.name) private payoutModel: Model<Payout>,
    private userService: UsersService,
  ) {}

  /**
   * Get all payouts of a business
   * @returns
   */

  async find({ ...query }) {
    try {
      const payouts = await this.payoutModel.find(query);

      return {
        payouts: payouts,
      };
    } catch (error) {
      throw new Error(error);
    }
  }

  async get_founder_cards({ ...query }) {
    const token_id = query.token_id;
    const wallet_address = await contract_business_nft.ownerOf(token_id);
    const array = await contract_foundercards.getIDsByOwner(wallet_address);
    return array.map((token_id: any) => parseInt(token_id.toString()));
  }

  async store_payout({ ...query }) {
    const user_id = query.user_id;
    const transaction = JSON.parse(query.transaction);
    const amount_in_cents = query.amount_in_cents;
    const created = Math.floor(Date.now() / 1000);

    await this.payoutModel.insertMany([
      {
        user: user_id,
        transaction,
        amount_paid: amount_in_cents,
        created,
      },
    ]);
  }
}
