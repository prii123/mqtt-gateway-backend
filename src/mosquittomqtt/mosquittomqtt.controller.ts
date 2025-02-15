import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { MqttService } from './mosquittomqtt.service';


@Controller('mqtt')
export class MqttController {
  constructor(private readonly mqttService: MqttService) {}

  @Post('publish')
  publish(@Body() data: { topic: string; message: string }) {
    this.mqttService.publish(data.topic, data.message);
    return { success: true };
  }

  @Post('subscribe')
  async subscribe(@Body() data: { topic: string }) {
    await this.mqttService.subscribe(data.topic);
    return { success: true, topic: data.topic };
  }

  @Post('unsubscribe')
  async unsubscribe(@Body() data: { topic: string }) {
    await this.mqttService.unsubscribe(data.topic);
    return { success: true };
  }

  @Get('last-messages')
  async getLastMessages() {
    return this.mqttService.getLastMessages();
  }
}
