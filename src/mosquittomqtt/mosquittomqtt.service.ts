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

  private messageBuffer: { topic: string; message: string; updatedAt: Date }[] = [];
  private isProcessing = false;

  constructor(
    @InjectModel(Topic.name) private topicModel: Model<TopicDocument>,
    @InjectModel(Publisher.name) private publisherModel: Model<PublisherDocument>
  ) {
    
    this.client = mqtt.connect('mqtt://localhost'); // Conexión a Mosquitto

    this.client.on('connect', async () => {
      console.log('Conectado a Mosquitto');

      // Suscribirse a todos los tópicos
      this.client.subscribe('#', (err) => {
        if (err) {
          console.error('❌ Error al suscribirse a todos los tópicos:', err);
        } else {
          console.log('✅ Suscrito a todos los tópicos (#)');
        }
      });

    });

    
    this.client.on('message', async (topic, message) => {
      console.log(`📩 Mensaje recibido: ${topic} -> ${message.toString()}`);
      
      await this.updatePublisher(topic, message.toString());

      // Enviar mensaje por WebSocket
      if (this.io) {
        this.io.emit('mqtt_message', { topic, message: message.toString() });
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
    const timestamp = new Date(); // Generar la fecha justo antes de guardar en MongoDB
    this.messageBuffer.push({ topic, message, updatedAt: timestamp });

    if (!this.isProcessing) {
        this.isProcessing = true;
        setTimeout(async () => {
            if (this.messageBuffer.length > 0) {
                const bulkOps = this.messageBuffer.map((msg) => ({
                    updateOne: {
                        filter: { topic: msg.topic },
                        update: { $set: { lastMessage: msg.message, updatedAt: msg.updatedAt } },
                        upsert: true,
                    },
                }));

                await this.publisherModel.bulkWrite(bulkOps);
                console.log(`📌 Guardados ${bulkOps.length} mensajes en MongoDB`);

                // Emitir actualización al frontend
                this.messageBuffer.forEach((msg) => {
                    this.io.emit("mqtt_message", {
                        topic: msg.topic,
                        lastMessage: msg.message,
                        updatedAt: msg.updatedAt,
                    });
                });

                this.messageBuffer = []; // Limpiar buffer después de actualizar
            }
            this.isProcessing = false;
        }, 0);
    }
}



  setSocketServer(io: Server) {
    this.io = io;

   // Escuchar cuando un cliente se une a una sala (tópico)
    io.on('connection', async(socket) => {

      // Enviar últimos mensajes guardados en MongoDB al conectar
      const lastMessages = await this.getLastMessages();
      // console.log(lastMessages)
      socket.emit('last_messages', lastMessages)
    });
  }

  async getLastMessages(): Promise<Publisher[]> {
    return this.publisherModel.find()
      .sort({ updatedAt: 1 }) // Ordenar en orden descendente
      .exec(); // Ejecutar la consulta correctamente
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

}


