import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export const RESERVED_PINS = new Set([6, 7, 8, 9, 10, 11]); // Pines reservados por el sistema
const MAX_DEVICES = 6; // Número máximo de dispositivos basado en los pines disponibles

class Dispositivo {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true, unique: true })
  topicPub: string;

  @Prop({ required: true, unique: true })
  topicSub: string;

  @Prop({ default: '' })
  lastMessage: string;

  @Prop({ default: () => new Date() })
  updatedAt: Date;

  @Prop({ required: true, validate: (pin) => !RESERVED_PINS.has(pin) })
  inputPin: number; // Pin de entrada analógico (ADC)

  @Prop({ required: true, validate: (pin) => !RESERVED_PINS.has(pin) })
  outputPin: number; // Pin de salida digital
}

@Schema()
export class Esp32 extends Document {
  @Prop({ required: true, unique: true })
  id: string;

  @Prop()
  name: string;

  @Prop()
  description: string;

  @Prop({ type: [Dispositivo], default: [], validate: (devices) => devices.length <= MAX_DEVICES })
  dispositivos: Dispositivo[];

  @Prop({ required: true, validate: (pin) => !RESERVED_PINS.has(pin) })
  connectionLedPin1: number;

  @Prop({ required: true, validate: (pin) => !RESERVED_PINS.has(pin) })
  connectionLedPin2: number;
}

export const Esp32Schema = SchemaFactory.createForClass(Esp32);
