import { BusinessesModule } from 'src/businesses/businesses.module';
import { NichesModule } from 'src/niches/niches.module';

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { NicheScriptsController } from './niche-scripts.controller';
import { NicheScript, NicheScriptSchema } from './niche-scripts.schema';
import { NicheScriptsService } from './niche-scripts.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: NicheScript.name, schema: NicheScriptSchema },
    ]),
    BusinessesModule,
    NichesModule,
  ],
  controllers: [NicheScriptsController],
  providers: [NicheScriptsService],
})
export class NicheScriptsModule {}
