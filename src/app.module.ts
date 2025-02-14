import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MosquittomqttModule } from './mosquittomqtt/mosquittomqtt.module';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://admin:password@localhost:27017/', {
      dbName: 'mqtt_database',
    }), MosquittomqttModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
