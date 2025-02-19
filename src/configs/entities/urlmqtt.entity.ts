import { Schema, Document } from 'mongoose';
import { Prop, SchemaFactory, Schema as NestSchema } from '@nestjs/mongoose';

@NestSchema()
export class UrlServerMQTT extends Document {
  @Prop({ required: true })
  url: string;

  @Prop({ required: true })
  port: number;

  @Prop({ required: true })
  username: string;

  @Prop({ required: true })
  password: string;
}

export const UrlServerMqttSchema = SchemaFactory.createForClass(UrlServerMQTT);