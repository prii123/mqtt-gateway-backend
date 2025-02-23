import { Module } from '@nestjs/common';
import { MqttService } from './mosquittomqtt.service';
import { MqttController } from './mosquittomqtt.controller';
import { MqttGateway } from './mqtt.gateway';
import { Publisher, PublisherSchema, Topic, TopicSchema } from './entities/mqtt.entity';
// import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';
import { Esp32Service } from './dispositivosESP32.service';
import { Esp32Schema } from './entities/dispositivos.entity';
import { Esp32Controller } from './dispositivosESP32.controller';


@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Topic', schema: TopicSchema },
      { name: 'Esp32', schema: Esp32Schema }
    ]),
  ],
  providers: [MqttService, MqttGateway, Esp32Service],
  controllers: [MqttController, Esp32Controller],
  exports: [MqttService],
})
export class MosquittomqttModule {}
