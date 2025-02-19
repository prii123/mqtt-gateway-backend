import { Injectable } from '@nestjs/common';
import * as mqtt from 'mqtt';
import { Server } from 'socket.io';
import { Publisher, PublisherDocument, Topic } from './entities/mqtt.entity';
import { InfluxDB, Point } from '@influxdata/influxdb-client';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';



@Injectable()
export class MqttService {
  private client: mqtt.MqttClient;
  private io: Server;
  private influxDB: InfluxDB;
  private writeApi;
  private messageBuffer: { topic: string; message: string; updatedAt: Date }[] = [];
  private isProcessing = false;

  constructor(
    @InjectModel(Topic.name) private topicModel: Model<Topic>,
    @InjectModel(Publisher.name) private publisherModel: Model<PublisherDocument>
  ) {

      // Configuración de InfluxDB
      const url = 'http://localhost:8086';
      const token = '4644a83e169462863f45b61527b5a7a89c9211e3e218bf734eacbf55407e7e76';
      const org = 'iot';
      const bucket = 'sensores';


    this.influxDB = new InfluxDB({ url, token });
    this.writeApi = this.influxDB.getWriteApi(org, bucket, 'ns');
    
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
      // console.log(`📩 Mensaje recibido: ${topic} -> ${message.toString()}`);
      
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
                for (const msg of this.messageBuffer) {
                  const point = new Point('sensores')
                      .tag('topic', msg.topic)
                      .stringField('message', msg.message)
                      .timestamp(msg.updatedAt);

                  await this.writeApi.writePoint(point);
              }

              // await this.writeApi.close();
              // console.log(`📌 Guardados ${this.messageBuffer.length} mensajes en InfluxDB`);

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

  async getLastMessages() {
    // return this.publisherModel.find()
    //   .sort({ updatedAt: 1 }) // Ordenar en orden descendente
    //   .exec(); // Ejecutar la consulta correctamente
    const query = `from(bucket: "sensores")
                    |> range(start: -1h)
                    |> filter(fn: (r) => r["_measurement"] == "sensores")
                    |> pivot(rowKey: ["_time"], columnKey: ["topic"], valueColumn: "_value")`;
    const result = await this.influxDB.getQueryApi('iot').collectRows(query);
    return result;
  }

 // Publicar un mensaje en un topic
 publish(topic: string, message: string) {
  this.client.publish(topic, message);
}

// // Suscribirse a un topic
// async subscribe(topic: string) {
//   this.client.subscribe(topic, async (err) => {
//     if (!err) {
//       console.log(`✅ Suscrito a ${topic}`);
//       const existingTopic = await this.topicModel.findOne({ name: topic }).exec();
//       if (!existingTopic) {
//         await this.topicModel.create({ name: topic });
//       }
//     }
//   });
// }

// Desuscribirse de un topic
// async unsubscribe(topic: string) {
//   this.client.unsubscribe(topic, async (err) => {
//     if (!err) {
//       console.log(`❌ Desuscrito de ${topic}`);
//       await this.topicModel.deleteOne({ name: topic }).exec();
//     }
//   });
// }


async getOrCreateTopic(name: string) {
  let topic = await this.topicModel.findOne({ name }).exec();
  if (!topic) {
    topic = new this.topicModel({ name, type: 'sensor', expectedValues: [], actions: [], unit: '' });
    await topic.save();
  }
  return topic;
}

async createTopic(createDto) {
  const topic = new this.topicModel(createDto);
  return topic.save();
}

async updateTopic(name: string, updateDto) {
  return this.topicModel.findOneAndUpdate({ name }, updateDto, { new: true });
}

}


