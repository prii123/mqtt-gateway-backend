import { Module } from '@nestjs/common';
import { ConfigsService } from './configs.service';
import { ConfigsController } from './configs.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { WifiPass, WifiPassSchema } from './entities/config.entity';
import { UrlServerMQTT, UrlServerMqttSchema } from './entities/urlmqtt.entity';
import { UrlServerMqttService } from './urlmqtt.service';

@Module({
  imports: [
    MongooseModule.forFeature(
    [
      { name: WifiPass.name, schema: WifiPassSchema },
      { name: UrlServerMQTT.name, schema: UrlServerMqttSchema }
    ]),
    ],
  controllers: [ConfigsController],
  providers: [ConfigsService, UrlServerMqttService],
})
export class ConfigsModule {}
