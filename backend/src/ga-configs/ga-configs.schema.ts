import { Document, SchemaTypes } from 'mongoose';
import { User } from 'src/users/users.schema';

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type GAnalyticConfigDocument = GAnalyticConfig & Document;

@Schema()
export class GAnalyticConfig {
  @Prop({ required: true })
  propertyId: string;

  @Prop({ required: true })
  clientId: string;

  @Prop({ type: SchemaTypes.ObjectId, ref: User.name })
  user: string & User;

  @Prop()
  gaToken: string;

  @Prop({ type: SchemaTypes.ObjectId, ref: User.name })
  createdBy: string & User;

  // For future dev
  // You may want to separate the config with the data
  @Prop({ type: 'object' })
  pageViews: {
    data?: {
      dimensionHeaders: Record<string, any>[];
      metricHeaders: Record<string, any>[];
      rows: Record<string, any>[];
      rowCount: number;
      metadata: Record<string, any>;
      kind: string;
    };
    lastUpdatedAt?: Date | string;
    propertyId?: string;
  };

  @Prop({ type: 'object' })
  browser: {
    data?: {
      dimensionHeaders: Record<string, any>[];
      metricHeaders: Record<string, any>[];
      rows: Record<string, any>[];
      rowCount: number;
      metadata: Record<string, any>;
      kind: string;
    };
    lastUpdatedAt?: Date | string;
    propertyId?: string;
  };
}

export const GAnalyticConfigSchema =
  SchemaFactory.createForClass(GAnalyticConfig);
