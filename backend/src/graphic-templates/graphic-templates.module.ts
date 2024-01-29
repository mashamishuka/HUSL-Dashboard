import { UsersModule } from 'src/users/users.module';

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { GraphicTemplatesController } from './graphic-templates.controller';
import {
  GraphicTemplate,
  GraphicTemplateSchema,
} from './graphic-templates.schema';
import { GraphicTemplatesService } from './graphic-templates.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: GraphicTemplate.name, schema: GraphicTemplateSchema },
    ]),
    UsersModule,
  ],
  controllers: [GraphicTemplatesController],
  providers: [GraphicTemplatesService],
})
export class GraphicTemplatesModule {}
