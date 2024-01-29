import { AuthModule } from 'src/auth/auth.module';
import { UsersModule } from 'src/users/users.module';

import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AccountsController } from './accounts.controller';
import { Account, AccountSchema } from './accounts.schema';
import { AccountsService } from './accounts.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Account.name, schema: AccountSchema }]),
    UsersModule,
    forwardRef(() => AuthModule),
  ],
  controllers: [AccountsController],
  providers: [AccountsService],
  exports: [AccountsService],
})
export class AccountsModule {}
