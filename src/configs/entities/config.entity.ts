
import { IWifiPasswordMCU } from './configs.interface';
// import { BaseEntity } from '../../config/base.entity';

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';


export type TopicDocument = Topic & Document;

@Schema({ collection: 'topics', timestamps: true }) // Usa la misma colección que TypeORM
export class Topic {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ type: Number, default: 0 })
  subscriptionCount: number; // Número de suscriptores actuales al tópico
}

export const TopicSchema = SchemaFactory.createForClass(Topic);