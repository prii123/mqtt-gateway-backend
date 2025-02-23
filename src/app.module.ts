import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MosquittomqttModule } from './mosquittomqtt/mosquittomqtt.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigsModule } from './configs/configs.module';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://admin:password@192.168.78.106:27017/', {
      dbName: 'mqtt_database',
    }), MosquittomqttModule, ConfigsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
