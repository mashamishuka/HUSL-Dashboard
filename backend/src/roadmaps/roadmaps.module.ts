import { UsersModule } from 'src/users/users.module';

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { RoadmapsController } from './roadmaps.controller';
import { Roadmap, RoadmapSchema } from './roadmaps.schema';
import { RoadmapsService } from './roadmaps.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Roadmap.name, schema: RoadmapSchema }]),
    UsersModule,
  ],
  controllers: [RoadmapsController],
  providers: [RoadmapsService],
})
export class RoadmapsModule {}
