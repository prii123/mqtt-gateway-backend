import { Module } from '@nestjs/common';
import { MqttService } from './mosquittomqtt.service';
import { MqttController } from './mosquittomqtt.controller';
import { MqttGateway } from './mqtt.gateway';
import { Publisher, PublisherSchema, Topic, TopicSchema } from './entities/mqtt.entity';
// import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';


@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Publisher', schema: PublisherSchema }, 
      { name: 'Topic', schema: TopicSchema }
    ]),
  ],
  providers: [MqttService, MqttGateway],
  controllers: [MqttController],
  exports: [MqttService],
})
export class MosquittomqttModule {}
