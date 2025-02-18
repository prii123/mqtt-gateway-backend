
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';


export type WifiPassDocument = WifiPass & Document;

@Schema({ collection: 'wifiPass', timestamps: true }) 
export class WifiPass {
  @Prop({ required: true, unique: true })
  wifi: string;

  @Prop({ required: true })
  pass: string;


}

export const WifiPassSchema = SchemaFactory.createForClass(WifiPass);