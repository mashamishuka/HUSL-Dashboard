import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { WalletsService } from './wallets.service';
import { Wallet } from './wallets.schema';
// import * as bcrypt from 'bcrypt';

@Controller('')
export class WalletsController {
  constructor(private readonly walletsService: WalletsService) {}

  @Post('/auth/register')
  async createWallet(
    @Body('address') address: string,
    @Body('signature') signature: string,
  ): Promise<Wallet> {
    // const saltOrRounds = 10;
    // const hashedPassword = await bcrypt.hash(address, saltOrRounds);
    const result = await this.walletsService.createWallet(address, signature);
    return result;
  }

  @Get('/wallets/:address/nonce')
  async getNonce(@Param('address') address: string): Promise<Wallet> {
    return this.walletsService.nonce(address);
  }

  @Get('/wallets/:address')
  async getWallets(@Param('address') address: string): Promise<Wallet> {
    return this.walletsService.getWallet({
      address,
    });
  }
}
