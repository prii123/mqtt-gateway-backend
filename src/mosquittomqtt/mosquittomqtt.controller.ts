import { Controller, Get, Post, Body, Patch, Param, Delete, Put } from '@nestjs/common';
import { MqttService } from './mosquittomqtt.service';


@Controller('mqtt')
export class MqttController {
  constructor(
    private readonly mqttService: MqttService
  ) {}

  @Post('publish')
  publish(@Body() data: { topic: string; message: string }) {
    this.mqttService.publish(data.topic, data.message);
    return { success: true };
  }

  @Get('last-messages')
  async getLastMessages() {
    return this.mqttService.getLastMessages();
  }


  @Get('topic/:name')
  getTopic(@Param('name') name: string) {
    return this.mqttService.getOrCreateTopic(name);
  }

  @Post("topic")
  createTopic(@Body() createTopicDto) {
    return this.mqttService.createTopic(createTopicDto);
  }

  @Put('topic/:name')
  updateTopic(@Param('name') name: string, @Body() updateDto) {
    return this.mqttService.updateTopic(name, updateDto);
  }




}
