import { Controller, Get, Post, Body } from '@nestjs/common';
import { ConfigsService } from './configs.service';
import { CreateConfigDto } from './dto/create-config.dto';
import { UrlServerMqttService } from './urlmqtt.service';


@Controller('configs')
export class ConfigsController {
  constructor(
    private readonly configsService: ConfigsService,
    private readonly urlMqttServer: UrlServerMqttService
  ) {}

  @Post("wificonf")
  create(@Body() createConfigDto: CreateConfigDto) {
    return this.configsService.create(createConfigDto);
  }

  @Get("wificonf")
  findAll() {
    console.log("pidio clave y wifi")
    return this.configsService.findAll();
  }

  @Post("urlmqttserver")
  createUrlMqttServer(@Body() createConfigDto: CreateConfigDto) {
    return this.urlMqttServer.create(createConfigDto);
  }

  @Get("urlmqttserver")
  findAllMqttServer() {
    return this.urlMqttServer.findAll();
  }

}
