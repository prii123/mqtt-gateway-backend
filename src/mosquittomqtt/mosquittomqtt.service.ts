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
  private topicSubscribers: Map<string, number> = new Map(); // Almacena el número de suscriptor

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

   // Escuchar cuando un cliente se une a una sala (tópico)
    io.on('connection', (socket) => {
      // Enviar el estado inicial de los suscriptores al nuevo cliente
      const initialSubscriberCounts = {};
      this.topicSubscribers.forEach((count, topic) => {
        initialSubscriberCounts[topic] = count;
      });
      socket.emit('initial_subscriber_counts', initialSubscriberCounts);

      socket.on('subscribe', (topic: string) => {
        socket.join(topic); // Unir al cliente a la sala del tópico
        console.log(`Cliente ${socket.id} se suscribió a ${topic}`);

        // Actualizar el número de suscriptores
        const subscriberCount = this.topicSubscribers.get(topic) || 0;
        this.topicSubscribers.set(topic, subscriberCount + 1);

        // Emitir el número actualizado de suscriptores
        this.io.emit('subscriber_count', { topic, count: subscriberCount + 1 });
      });

      socket.on('unsubscribe', (topic: string) => {
        socket.leave(topic); // Sacar al cliente de la sala del tópico
        console.log(`Cliente ${socket.id} se desuscribió de ${topic}`);

        // Actualizar el número de suscriptores
        const subscriberCount = this.topicSubscribers.get(topic) || 0;
        if (subscriberCount > 0) {
          this.topicSubscribers.set(topic, subscriberCount - 1);
        }

        // Emitir el número actualizado de suscriptores
        this.io.emit('subscriber_count', { topic, count: subscriberCount - 1 });
      });
    });
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


