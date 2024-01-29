import * as bcrypt from 'bcrypt';
import * as ethUtil from 'ethereumjs-util';
import { ethers } from 'ethers';
import * as moment from 'moment';
import { Account } from 'src/accounts/accounts.schema';
import { AccountsService } from 'src/accounts/accounts.service';
import { User } from 'src/users/users.schema';
import { UsersService } from 'src/users/users.service';
import { WalletsService } from 'src/wallets/wallets.service';

import {
  BadRequestException,
  Injectable,
  NotAcceptableException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { CreateUserDto } from '../users/dto/create-user.dto';

const rpcAddress =
  'https://mainnet.infura.io/v3/d044127f59224a2aa4d6e258b0551402';
const provider = new ethers.providers.JsonRpcProvider(rpcAddress);

const ADDRESS_LUKAS = '0x663Ae8DE42D59C074e2ceA7e02f63Cd0f5dcC52c';
const ADDRESS_OWNING_FOUNDERCARDS_AND_BUSINESS_NFTS =
  '0x8941e58CA4240E26D46142A4a114e29A3B8249d9';

function is_lukas(address: string) {
  return address.toLowerCase() === ADDRESS_LUKAS.toLowerCase();
}

async function fetchNftIdsFromAddress(address: string) {
  if (is_lukas(address)) {
    address = ADDRESS_OWNING_FOUNDERCARDS_AND_BUSINESS_NFTS;
  }

  const ADDRESS_ERC721 = '0x4cB1420AA77B731acbe258F8CA0f0b9ad4aDbD09';
  const contractNFT = new ethers.Contract(
    ADDRESS_ERC721,
    [
      'function getIDsByOwner(address owner_) external view returns (uint256[] memory)',
    ],
    provider,
  );
  const tokens = await contractNFT.getIDsByOwner(address);
  return tokens;
}

async function fetchFoundersCards(address: string) {
  if (is_lukas(address)) {
    address = ADDRESS_OWNING_FOUNDERCARDS_AND_BUSINESS_NFTS;
  }

  const ADDRESS_FOUNDERS_CARDS = '0xbbeb904272fa9888c50da37d16b9099fcae78244';
  const contractNFT = new ethers.Contract(
    ADDRESS_FOUNDERS_CARDS,
    [
      'function getIDsByOwner(address owner) external view returns (uint256[] memory)',
    ],
    provider,
  );
  const tokens = await contractNFT.getIDsByOwner(address);
  return tokens;
}

function derive_address_from_signature(nonce: number, signature: string) {
  const msg = `Nonce: ${nonce}`;
  // Convert msg to hex string
  const msgHex = ethUtil.bufferToHex(Buffer.from(msg));
  // Check if signature is valid
  const msgBuffer = ethUtil.toBuffer(msgHex);
  const msgHash = ethUtil.hashPersonalMessage(msgBuffer);
  // const signatureBuffer = ethUtil.toBuffer(signature);
  const signatureParams = ethUtil.fromRpcSig(signature);
  const publicKey = ethUtil.ecrecover(
    msgHash,
    signatureParams.v,
    signatureParams.r,
    signatureParams.s,
  );
  const addresBuffer = ethUtil.publicToAddress(publicKey);
  return ethUtil.bufferToHex(addresBuffer);
}

function are_same_addresses(address1: string, address2: string) {
  return address1.toLowerCase() === address2.toLowerCase();
}

@Injectable()
export class AuthService {
  constructor(
    private readonly walletService: WalletsService,
    private readonly accountService: AccountsService,
    private readonly userService: UsersService,
    private jwtService: JwtService,
  ) {
    //
  }

  async createOrReturnUserForFoundercard(foundersCard: number) {
    const user = await this.userService.findOneByFoundersCard(
      foundersCard + '',
    );
    if (user) {
      return user;
    }
    const new_user: CreateUserDto = {
      name: 'FounderCard #' + foundersCard,
      nftId: '-' + foundersCard,
      foundersCard: '' + foundersCard,
      company: '',
      email: '',
      websiteKey: '',
      productUrl: '',
      password: '',
    };
    await this.userService.create(new_user);
    return await this.userService.findOneByFoundersCard(foundersCard + '');
  }

  async getUserForNFTs(
    nftIds: number[],
    foundersCards: number[],
  ): Promise<User> {
    if (nftIds.length > 0) {
      return await this.userService
        .findOneByNFT(nftIds[0].toString())
        .then(async (user) => {
          if (!user.foundersCard && foundersCards.length > 0) {
            await this.userService.update(user._id, {
              foundersCard: foundersCards[0] + '',
            });

            user.foundersCard = foundersCards[0] + '';
          }

          return user;
        });
    } else if (foundersCards.length > 0) {
      return await this.createOrReturnUserForFoundercard(foundersCards[0]);
    } else {
      throw new UnauthorizedException("You don't own any NFT");
    }
  }

  async signature(data: any): Promise<Record<string, any>> {
    const address = data?.address || data?.publicAddress;
    const signature = data?.signature;

    if (!address || !signature) {
      throw new NotAcceptableException('address or signature is missing');
    }
    // find wallet by address
    const wallet = await this.walletService.getWallet({ address });

    if (wallet) {
      const address = derive_address_from_signature(wallet.nonce, signature);

      if (are_same_addresses(address, wallet?.address)) {
        this.walletService.nonce(address);

        const whitelist = ['0x1d1a6d87ba423fab8a8275270be4fad11611b8de'];

        if (whitelist.includes(address)) {
          const user = await this.userService.findOneByNFT('9999');

          const token = this.jwtService.sign({
            _id: user?._id,
            wallet_id: wallet._id,
            address: wallet?.address,
            business: user?.business?.map((v) => (v as any)._id?.toString()),
          });
          return {
            token,
            type: 'wallet',
            address,
            signature,
            wallet,
            user,
          };
        }

        const big_numbers_to_numbers = (big_numbers) =>
          big_numbers.map((big_number: any) => parseInt(big_number._hex, 16));

        const nftIds = await fetchNftIdsFromAddress(address).then(
          big_numbers_to_numbers,
        );
        const foundersCards = await fetchFoundersCards(address).then(
          big_numbers_to_numbers,
        );

        const user = await this.getUserForNFTs(nftIds, foundersCards);

        if (user == null) {
          throw new UnauthorizedException(
            'No business account has been created for your NFT yet',
          );
        }

        const token = this.jwtService.sign({
          _id: (user as any)?._id, //wallet._id,
          wallet_id: wallet._id,
          address: wallet?.address,
          business: user?.business?.map((v) => (v as any)._id?.toString()),
        });

        return {
          token,
          type: 'wallet',
          address,
          signature,
          wallet,
          user,
        };
      } else {
        throw new NotAcceptableException('Invalid signature');
      }
    }
  }

  /**
   * User direct login by NFT ID
   * @param data
   */
  async loginByNft(data: Record<string, any>) {
    const NFT_ID = data?.nftId;
    if (!NFT_ID) {
      throw new BadRequestException('NFT ID is required.');
    }
    // find user by NFT ID
    const user = await this.userService.findOneByNFT(NFT_ID);
    if (user) {
      const token = this.jwtService.sign({
        _id: user._id,
        nftId: user?.nftId,
      });
      return {
        token,
        type: 'user',
        user,
      };
    } else {
      throw new BadRequestException('User not found.');
    }
  }

  /**
   * Admin login
   * @param data
   * @returns
   */
  async loginAdmin(data: Record<string, any>) {
    // const payload = { address: wallet.address, sub: wallet._id };
    const identifier = data?.identifier;
    const password = data?.password;

    if (!identifier || !password) {
      throw new NotAcceptableException('identifier and password are required.');
    }
    // find wallet by identifier
    const adminAccount = await this.userService.findOneByQuery({
      $or: [{ nftId: identifier }, { email: identifier }],
    });
    if (adminAccount?.role !== 'admin') {
      throw new BadRequestException('You are not an admin.');
    }

    if (
      adminAccount?.password &&
      (adminAccount?.email || adminAccount?.nftId)
    ) {
      const { password: pw, ...user }: User =
        Object.assign(adminAccount)?.toObject();
      // check if password is valid
      const isMatch = await bcrypt.compare(password, pw);
      if (isMatch) {
        const token = this.jwtService.sign({
          _id: (user as any)?._id,
          identifier: user?.nftId || user?.email,
          role: user?.role,
        });

        return {
          token,
          type: 'admin',
          user,
        };
      }
      throw new BadRequestException('Invalid username or password');
    }
    throw new BadRequestException('Account not found.');
  }

  /**
   * User credentials login
   * @param data
   * @returns
   */
  async authLogin(data: Record<string, any>) {
    // const payload = { address: wallet.address, sub: wallet._id };
    const identifier = data?.identifier;
    const password = data?.password;

    if (!identifier || !password) {
      throw new NotAcceptableException('identifier and password are required.');
    }
    // find wallet by identifier
    const userAccount = await this.userService.findOneByQuery({
      $or: [{ nftId: identifier }, { email: identifier }],
    });
    // if it's a user account (not member) and there is no nftId, then reject the request
    if (!userAccount?.nftId && userAccount?.role !== 'member') {
      throw new BadRequestException('No NFT ID found.');
    }

    if (userAccount?.password && (userAccount?.email || userAccount?.nftId)) {
      const { password: pw, ...userData }: User =
        Object.assign(userAccount)?.toObject();
      // check if password is valid
      const isMatch = await bcrypt.compare(password, pw);
      if (isMatch) {
        let user = userData;
        // if user is a member of a team, then we need to get master account/owner instead
        if (userAccount?.role === 'member') {
          user = await this.userService.findOneByQuery({
            _id: (userAccount?.team?.owner as any)._id,
          });
        }

        const token = this.jwtService.sign({
          _id: (user as any)?._id,
          identifier: user?.nftId || user?.email,
          role: userAccount?.role,
          memberId: userAccount?._id,
        });
        // save last login data
        await this.userService.update((user as any)?._id, {
          lastLogin: moment().unix(),
        });

        return {
          token,
          type: 'user',
          user,
        };
      }
      throw new BadRequestException('Invalid username or password');
    }
    throw new BadRequestException('Account not found.');
  }

  /**
   * Account / access manager login, created by user
   * @param data
   * @returns
   */
  async accountLogin(data: Record<string, any>) {
    // const payload = { address: wallet.address, sub: wallet._id };
    const username = data?.username;
    const password = data?.password;

    if (!username || !password) {
      throw new NotAcceptableException('username and password are required.');
    }
    // find wallet by username
    const accounts = await this.accountService.findAll({
      username,
    });

    if (accounts?.length > 0) {
      const { password: pw, ...account }: Account = Object.assign(
        accounts[0],
      )?.toObject();
      // check if password is valid
      const isMatch = await bcrypt.compare(password, pw);
      if (isMatch) {
        const token = this.jwtService.sign({
          _id: (account as any)?._id,
          username: account?.username,
          role: account?.user?.role,
        });
        // after signing a token, we should verify the data
        // also, we won't update if it's already verified
        if (token && !account.verified) {
          this.accountService.update((account as any)?._id, {
            verified: true,
          });
        }

        return {
          token,
          type: 'account',
          username,
          account,
        };
      }
      throw new BadRequestException('Invalid username or password');
    }
    throw new BadRequestException('Account not found.');
  }

  async validateToken(token: string): Promise<boolean> {
    // validate basic auth, basic auth is nftId:password:requestedAt (unix) in base64
    // decode it first
    const decoded = Buffer.from(token, 'base64').toString();
    // split it at the colon
    const [nftId, password, requestedAt] = decoded.split(':');
    // if there is no requestedAt, then it's invalid
    if (!requestedAt) {
      throw new UnauthorizedException('InvalidToken');
    }
    // if requestedAt is more than 30 minutes ago, then it's invalid
    const now = moment();
    const requestedAtMoment = moment.unix(Number(requestedAt));
    const diff = now.diff(requestedAtMoment, 'minutes');
    if (diff > 30) {
      throw new UnauthorizedException('Token expired.');
    }
    const validate = await this.userService.validateBasicAuth(nftId, password);
    if (!validate) {
      return false;
    }
    return true;
  }
}
