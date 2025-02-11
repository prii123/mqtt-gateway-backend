import { Injectable } from '@nestjs/common';
import * as mqtt from 'mqtt';
import { Server } from 'socket.io';
import { Topic } from './entities/mqtt.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class MqttService {
  private client: mqtt.MqttClient;
  private io: Server;
  private subscribedTopics: Set<string> = new Set(); // Almacena topics suscritos


  constructor(
    @InjectRepository(Topic) 
    private readonly topicRepository: Repository<Topic>,
  ) {
    
    this.client = mqtt.connect('mqtt://localhost'); // Conexión a Mosquitto

    this.client.on('connect', async () => {
      console.log('Conectado a Mosquitto');
      // Recuperar topics desde la base de datos al iniciar el servidor
      const topics = await this.topicRepository.find();
      topics.forEach((t) => this.client.subscribe(t.name));
    });

    this.client.on('message', (topic, message) => {
      console.log(`Mensaje recibido en ${topic}: ${message.toString()}`);
    });

    this.client.on('message', (topic, message) => {
    // Emitir mensaje a todos los clientes WebSocket
      if (this.io) {
        this.io.emit('mqtt_message', { topic, message: message });
      }
    });


    

  }

  setSocketServer(io: Server) {
    this.io = io;
  }

  // Publicar un mensaje en un topic
  publish(topic: string, message: string) {
    this.client.publish(topic, message);
  }

  // Suscribirse a un topic
  async subscribe(topic: string) {
    this.client.subscribe(topic, async (err) => {
      if (!err) {
        console.log(`✅ Suscrito a ${topic}`);
        const existingTopic = await this.topicRepository.findOneBy({ name: topic });
        if (!existingTopic) {
          await this.topicRepository.save({ name: topic });
        }
      }
    });
  }

  // Desuscribirse de un topic
  async unsubscribe(topic: string) {
    this.client.unsubscribe(topic, async (err) => {
      if (!err) {
        console.log(`❌ Desuscrito de ${topic}`);
        await this.topicRepository.delete({ name: topic });
      }
    });
  }

  async getSubscribedTopics(): Promise<string[]> {
    const topics = await this.topicRepository.find();
    return topics.map((t) => t.name);
  }

}


