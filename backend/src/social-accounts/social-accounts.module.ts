import { UsersModule } from 'src/users/users.module';

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { SocialAccountsController } from './social-accounts.controller';
import { SocialAccount, SocialAccountSchema } from './social-accounts.schema';
import { SocialAccountsService } from './social-accounts.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SocialAccount.name, schema: SocialAccountSchema },
    ]),
    UsersModule,
  ],
  controllers: [SocialAccountsController],
  providers: [SocialAccountsService],
  exports: [SocialAccountsService],
})
export class SocialAccountsModule {}
