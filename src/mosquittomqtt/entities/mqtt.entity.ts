import { Entity, PrimaryGeneratedColumn, Column, Unique } from 'typeorm';
import { ITopic } from '../topics.interface';
import { BaseEntity } from '../../config/base.entity';

import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

// @Entity({name:"topics"})
// export class Topic extends BaseEntity implements ITopic {
//   @Column({ unique: true })
//   name: string;

//   @Column({ type: 'int', default: 0 })
//   subscriptionCount: number; // Número de suscriptores actuales al tópico
// }


// @Entity()
// @Unique(['topic']) // Asegura que no haya duplicados de tópico + IP
// export class Publisher {
//   @PrimaryGeneratedColumn()
//   id: number;

//   @Column()
//   topic: string;

//   @Column({ nullable: true }) // El mensaje puede ser opcional
//   lastMessage: string;

//   @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
//   updatedAt: Date;
// }

export type TopicDocument = Topic & Document;

@Schema({ collection: 'topics', timestamps: true }) // Usa la misma colección que TypeORM
export class Topic {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ type: Number, default: 0 })
  subscriptionCount: number; // Número de suscriptores actuales al tópico
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