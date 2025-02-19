import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';


@Schema()
export class Topic extends Document {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: true, enum: ['sensor', 'actuator', 'both'] })
  type: string;

  @Prop({ type: [String] })
  expectedValues?: string[];

  @Prop({ type: [String] })
  actions?: string[];

  @Prop({ type: String })
  unit?: string;
}

export const TopicSchema = SchemaFactory.createForClass(Topic);


export type PublisherDocument = Publisher & Document;
@Schema({ timestamps: true })
export class Publisher {
  @Prop({ required: true, unique: true })
  topic: string;

  @Prop()
  lastMessage: string;

  @Prop() // ✅ Agregar manualmente para que TypeScript lo reconozca
  updatedAt: Date;
}

export const PublisherSchema = SchemaFactory.createForClass(Publisher);