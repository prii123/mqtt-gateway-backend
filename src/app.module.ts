import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MosquittomqttModule } from './mosquittomqtt/mosquittomqtt.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSourceConfig } from './config/data.source';

@Module({
  imports: [ TypeOrmModule.forRoot({...DataSourceConfig}),MosquittomqttModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
