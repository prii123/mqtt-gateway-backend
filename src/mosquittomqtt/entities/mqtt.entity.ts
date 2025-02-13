import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { ITopic } from '../topics.interface';
import { BaseEntity } from '../../config/base.entity';

@Entity({name:"topics"})
export class Topic extends BaseEntity implements ITopic {
  @Column({ unique: true })
  name: string;

  @Column({ type: 'int', default: 0 })
  subscriptionCount: number; // Número de suscriptores actuales al tópico
}
