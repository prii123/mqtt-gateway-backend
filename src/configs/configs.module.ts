import { Module } from '@nestjs/common';
import { ConfigsService } from './configs.service';
import { ConfigsController } from './configs.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { WifiPass, WifiPassSchema } from './entities/config.entity';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: WifiPass.name, schema: WifiPassSchema }]),
    ],
  controllers: [ConfigsController],
  providers: [ConfigsService],
})
export class ConfigsModule {}
