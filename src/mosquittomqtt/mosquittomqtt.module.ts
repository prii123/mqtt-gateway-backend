import { Module } from '@nestjs/common';
import { MqttService } from './mosquittomqtt.service';
import { MqttController } from './mosquittomqtt.controller';
import { MqttGateway } from './mqtt.gateway';
import { Topic } from './entities/mqtt.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports:[TypeOrmModule.forFeature([Topic])],
  providers: [MqttService, MqttGateway],
  controllers: [MqttController],
  exports: [MqttService],
})
export class MosquittomqttModule {}
