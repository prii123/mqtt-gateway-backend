// import { Controller, Get, Post, Body, Patch, Param, Delete, Put } from '@nestjs/common';
// import { MqttService } from './mosquittomqtt.service';


// @Controller('mqtt')
// export class MqttController {
//   constructor(
//     private readonly mqttService: MqttService
//   ) {}

//   @Post('publish')
//   publish(@Body() data: { topic: string; message: string }) {
//     this.mqttService.publish(data.topic, data.message);
//     return { success: true };
//   }

//   @Post('subscribe')
//   suscribe(@Body() data: { topic: string }) {
//     this.mqttService.suscribe(data.topic);
//     return { success: true };
//   }
  

//   @Get('last-messages')
//   async getLastMessages() {
//     return this.mqttService.getLastMessages();
//   }


//   @Get('topics/:name')
//   getTopic(@Param('name') name: string) {
//     return this.mqttService.getOrCreateTopic(name);
//   }

//   @Post("topic")
//   createTopic(@Body() createTopicDto) {
//     return this.mqttService.createTopic(createTopicDto);
//   }

//   @Put('topic/:name')
//   updateTopic(@Param('name') name: string, @Body() updateDto) {
//     return this.mqttService.updateTopic(name, updateDto);
//   }




// }


import { Controller, Get, Post, Body, Patch, Param, Delete, Put, HttpException, HttpStatus } from '@nestjs/common';
import { MqttService } from './mosquittomqtt.service';

@Controller('mqtt')
export class MqttController {
  constructor(private readonly mqttService: MqttService) {}

  // @Get('restaurar-suscripciones')
  // async suscribirAtodosLosTopics() {
  //   const topics = await this.mqttService.findAll(); // Obtener todos los topics
  //   return { message: `Suscripciones restauradas a  tópicos.` };
  // }

  // Publicar un mensaje en un tópico
  @Post('publish')
  publish(@Body() data: { topic: string; message: string }) {
    try {
      this.mqttService.publish(data.topic, data.message);
      return { success: true, message: `Mensaje publicado en el tópico: ${data.topic}` };
    } catch (error) {
      throw new HttpException(
        `Error al publicar el mensaje: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Suscribirse a un tópico
  @Post('subscribe')
  async subscribe(@Body() data: { topic: string }) {
    try {
      // await this.mqttService.getOrCreateTopic(data.topic); // Crear el tópico si no existe
      this.mqttService.subscribe(data.topic);
      return { success: true, message: `Suscrito al tópico: ${data.topic}` };
    } catch (error) {
      throw new HttpException(
        `Error al suscribirse al tópico: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Desuscribirse de un tópico
  @Post('unsubscribe')
  async unsubscribe(@Body() data: { topic: string }) {
    try {
      this.mqttService.unsubscribe(data.topic);
      return { success: true, message: `Desuscrito del tópico: ${data.topic}` };
    } catch (error) {
      throw new HttpException(
        `Error al desuscribirse del tópico: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Obtener los últimos mensajes
  // @Get('last-messages')
  // async getLastMessages() {
  //   try {
  //     const messages = await this.mqttService.getLastMessages();
  //     return { success: true, data: messages };
  //   } catch (error) {
  //     throw new HttpException(
  //       `Error al obtener los últimos mensajes: ${error.message}`,
  //       HttpStatus.INTERNAL_SERVER_ERROR,
  //     );
  //   }
  // }

  // Obtener todos los tópicos activos
  // @Get('topics/active')
  // async getActiveTopics() {
  //   try {
  //     const topics = this.mqttService.getActiveTopics();
  //     return { success: true, data: topics };
  //   } catch (error) {
  //     throw new HttpException(
  //       `Error al obtener los tópicos activos: ${error.message}`,
  //       HttpStatus.INTERNAL_SERVER_ERROR,
  //     );
  //   }
  // }

  // Obtener o crear un tópico
  // @Get('topics/:name')
  // async getTopic(@Param('name') name: string) {
  //   try {
  //     const topic = await this.mqttService.getOrCreateTopic(name);
  //     return { success: true, data: topic };
  //   } catch (error) {
  //     throw new HttpException(
  //       `Error al obtener el tópico: ${error.message}`,
  //       HttpStatus.INTERNAL_SERVER_ERROR,
  //     );
  //   }
  // }

  // Crear un tópico
  @Post('topic')
  async createTopic(@Body() createTopicDto) {
    try {
      const topic = await this.mqttService.createTopic(createTopicDto);
      return { success: true, data: topic };
    } catch (error) {
      throw new HttpException(
        `Error al crear el tópico: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Actualizar un tópico
  @Put('topic/:name')
  async updateTopic(@Param('name') name: string, @Body() updateDto) {
    try {
      const topic = await this.mqttService.updateTopic(name, updateDto);
      return { success: true, data: topic };
    } catch (error) {
      throw new HttpException(
        `Error al actualizar el tópico: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Eliminar un tópico
  @Delete('topic/:name')
  async deleteTopic(@Param('name') name: string) {
    try {
      await this.mqttService.deleteTopic(name);
      return { success: true, message: `Tópico eliminado: ${name}` };
    } catch (error) {
      throw new HttpException(
        `Error al eliminar el tópico: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}