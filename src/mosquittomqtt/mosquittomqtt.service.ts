import { Injectable } from '@nestjs/common';
import * as mqtt from 'mqtt';
import { Server } from 'socket.io';
import { Publisher, PublisherDocument, Topic, TopicDocument } from './entities/mqtt.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class MqttService {
  private client: mqtt.MqttClient;
  private io: Server;
  private subscribedTopics: Set<string> = new Set(); // Almacena topics suscritos
  private topicSubscribers: Map<string, number> = new Map(); // Almacena el número de suscriptor

  constructor(
    @InjectModel(Topic.name) private topicModel: Model<TopicDocument>,
    @InjectModel(Publisher.name) private publisherModel: Model<PublisherDocument>
  ) {
    
    this.client = mqtt.connect('mqtt://localhost'); // Conexión a Mosquitto

    this.client.on('connect', async () => {
      console.log('Conectado a Mosquitto');
      // Recuperar topics desde la base de datos al iniciar el servidor
      const topics = await this.topicModel.find();
      topics.forEach((t) => {
        this.client.subscribe(t.name, (err) => {
          if (err) {
            console.error(`❌ Error al suscribirse a ${t.name}:`, err);
          } else {
            console.log(`✅ Suscrito a ${t.name}`);
          }
        });
      });
    });

    this.client.on('message', async (topic, message) => {
      console.log(topic + message)
      const pus =  this.updatePublisher(topic, message.toString());
      // console.log(`Mensaje recibido en ${ pus }`);
    });

    this.client.on('message', (topic, message) => {
      // console.log({ topic, message: message })
    // Emitir mensaje a todos los clientes WebSocket
      if (this.io) {
        this.io.emit('mqtt_message', { topic, message: message });
      }
    });

    this.client.on('error', (err) => {
      console.error('❌ Error en MQTT:', err);
    });
    
    this.client.on('offline', () => {
      console.warn('⚠️ Cliente MQTT desconectado');
    });
    
    this.client.on('reconnect', () => {
      console.log('♻️ Intentando reconectar a MQTT...');
    });
    


    

  }

  async updatePublisher(topic: string, message: string): Promise<void> {
    await this.publisherModel.updateOne(
      { topic }, // Encuentra el documento por topic
      { $set: { lastMessage: message } }, // Actualiza el mensaje
      { upsert: true } // Si no existe, lo crea
    );
  }

  async getLastMessages(): Promise<Publisher[]> {
    return this.publisherModel.find({
      order: { updatedAt: 'DESC' }, // Ordenar por fecha de actualización
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
      const existingTopic = await this.topicModel.findOne({ name: topic }).exec();
      if (!existingTopic) {
        await this.topicModel.create({ name: topic });
      }
    }
  });
}

// Desuscribirse de un topic
async unsubscribe(topic: string) {
  this.client.unsubscribe(topic, async (err) => {
    if (!err) {
      console.log(`❌ Desuscrito de ${topic}`);
      await this.topicModel.deleteOne({ name: topic }).exec();
    }
  });
}

// Obtener todos los topics suscritos
async getSubscribedTopics(): Promise<string[]> {
  const topics = await this.topicModel.find().exec();
  return topics.map((t) => t.name);
}

}


