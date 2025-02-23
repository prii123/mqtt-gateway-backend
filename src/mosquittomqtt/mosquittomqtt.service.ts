// import { Injectable } from '@nestjs/common';
// import * as mqtt from 'mqtt';
// import { Server, Socket } from 'socket.io';
// import { Publisher, PublisherDocument, Topic } from './entities/mqtt.entity';
// import { InfluxDB, Point } from '@influxdata/influxdb-client';
// import { InjectModel } from '@nestjs/mongoose';
// import { Model } from 'mongoose';

// @Injectable()
// export class MqttService {
//   private client: mqtt.MqttClient;
//   private io: Server;
//   private influxDB: InfluxDB;
//   private writeApi;
//   private messageBuffer: { topic: string; message: string; updatedAt: Date }[] = [];
//   private isProcessing = false;
//   private subscribedTopics = new Set<string>(); // Tópicos suscritos
//   private activeTopics = new Set<string>(); // Tópicos activos (recibieron mensajes)

//   constructor(
//     @InjectModel(Topic.name) private topicModel: Model<Topic>,
//   ) {
//     // Configuración de InfluxDB
//     const url = 'http://192.168.78.106:8086';
//     const token = 'KI6GdXtQ6Ls9NgbfcvVczf9a6RjSzJykR4avCcWpimlib1Gk95K5ZFYj22t-suTkwTGF2O3iW317oFaIsVAvnA==';
//     const org = 'iot';
//     const bucket = 'sensores';

//     this.influxDB = new InfluxDB({ url, token });
//     this.writeApi = this.influxDB.getWriteApi(org, bucket, 'ns');

//     // Conexión a Mosquitto
//     this.client = mqtt.connect('mqtt://192.168.78.106');

//     // Evento de conexión
//     this.client.on('connect', async () => {
//       console.log('Conectado a Mosquitto');
//       this.findAll()
//     });

//     // Manejar mensajes recibidos
//     this.client.on('message', async (topic, message) => {
//       console.log(`Mensaje recibido en el tópico: ${topic} -> ${message.toString()}`);
//       await this.updatePublisher(topic, message.toString());
//       // Enviar mensaje por WebSocket
//       if (this.io) {
//         console.log("trasnmi " + topic)
//         this.io.emit('mqtt_message', { topic, message: message.toString() });
//       }
//     });

//     // Manejo de errores y desconexión
//     this.client.on('error', (err) => {
//       console.error('❌ Error en MQTT:', err);
//     });

//     this.client.on('offline', () => {
//       console.warn('⚠️ Cliente MQTT desconectado');
//     });

//     this.client.on('reconnect', () => {
//       console.log('♻️ Intentando reconectar a MQTT...');
//     });
//   }



//   // Actualizar el publicador y guardar en InfluxDB
//   async updatePublisher(topic: string, message: string): Promise<void> {
//     const timestamp = new Date();
//     this.messageBuffer.push({ topic, message, updatedAt: timestamp });

//     if (!this.isProcessing) {
//       this.isProcessing = true;
//       setTimeout(async () => {
//         if (this.messageBuffer.length > 0) {
//           for (const msg of this.messageBuffer) {
//             const point = new Point('sensores')
//               .tag('topic', msg.topic)
//               .stringField('message', msg.message)
//               .timestamp(msg.updatedAt);

//             try {
//               await this.writeApi.writePoint(point);
//             } catch (err) {
//               console.error('❌ Error al escribir en InfluxDB:', err);
//             }
//           }

//           this.messageBuffer.forEach((msg) => {
//             console.log("transmitiendo... " + msg.topic)
//             this.io.emit('mqtt_update', {
//               topic: msg.topic,
//               lastMessage: msg.message,
//               updatedAt: msg.updatedAt,
//             });
//           });

//           this.messageBuffer = []; // Limpiar buffer después de actualizar
//         }
//         this.isProcessing = false;
//       }, 0);
//     }
//   }

//   // Configurar el servidor de Socket.IO
//   setSocketServer(io: Server) {
//     this.io = io;

//     // io.on('connection', async (socket: Socket) => {
//     //   // Enviar últimos mensajes guardados en InfluxDB al conectar
//     //   const lastMessages = await this.getLastMessages();
//     //   socket.emit('last_messages', lastMessages);

//     //   // Unirse a la sala del tópico cuando el cliente lo solicite
//     //   socket.on('subscribe', (topic: string) => {
//     //     socket.join(topic);
//     //     console.log(`Cliente suscrito al tópico: ${topic}`);
//     //   });

//     //   // Salir de la sala del tópico cuando el cliente lo solicite
//     //   socket.on('unsubscribe', (topic: string) => {
//     //     socket.leave(topic);
//     //     console.log(`Cliente desuscrito del tópico: ${topic}`);
//     //   });
//     // });
//   }

//     async findAll() {
//    console.log('🔄 Restaurando suscripciones MQTT...');
//     const topics = await this.topicModel.find();
//     topics.forEach((topic) => this.subscribe(topic.name));
//     console.log(`✅ Suscrito a ${topics.length} tópicos al iniciar el servidor.`);
    
//   }

//   // Obtener los últimos mensajes de InfluxDB
//   async getLastMessages() {
//     const query = `from(bucket: "sensores")
//                     |> range(start: -1h)
//                     |> filter(fn: (r) => r["_measurement"] == "sensores")
//                     |> pivot(rowKey: ["_time"], columnKey: ["topic"], valueColumn: "_value")`;
//     const result = await this.influxDB.getQueryApi('iot').collectRows(query);
//     return result;
//   }

//   // Publicar un mensaje en un tópico
//   publish(topic: string, message: string) {
//     console.log({ topic, message });
//     this.client.publish(topic, message);
//   }
// // Suscribirse a un tópico
// subscribe(topic: string) {
//   if (this.subscribedTopics.has(topic)) {
//     console.log(`✅ Ya estás suscrito al tópico: ${topic}`);
//     return;
//   }

//   this.client.subscribe(topic, (err) => {
//     if (err) {
//       console.error(`❌ Error al suscribirse al tópico ${topic}:`, err);
//       throw new Error(`Error al suscribirse al tópico: ${err.message}`);
//     } else {
//       console.log(`✅ Suscrito al tópico: ${topic}`);
//       this.subscribedTopics.add(topic);
//     }
//   });
// }

// // Desuscribirse de un tópico
// unsubscribe(topic: string) {
//   if (!this.subscribedTopics.has(topic)) {
//     console.log(`❌ No estás suscrito al tópico: ${topic}`);
//     return;
//   }

//   this.client.unsubscribe(topic, (err) => {
//     if (err) {
//       console.error(`❌ Error al desuscribirse del tópico ${topic}:`, err);
//       throw new Error(`Error al desuscribirse del tópico: ${err.message}`);
//     } else {
//       console.log(`❌ Desuscrito del tópico: ${topic}`);
//       this.subscribedTopics.delete(topic);
//     }
//   });
// }



//   // Obtener todos los tópicos activos
//   getActiveTopics(): string[] {
//     return Array.from(this.activeTopics);
//   }


//   // Obtener o crear un tópico
//   async getOrCreateTopic(name: string) {
//     let topic = await this.topicModel.findOne({ name }).exec();
//     if (!topic) {
//       topic = new this.topicModel({ name, type: 'sensor', expectedValues: [], actions: [], unit: '' });
//       return await topic.save();
//     }
//     return topic;
//   }

//   // Crear un tópico
//   async createTopic(createDto) {
//     const topic = new this.topicModel(createDto);
//     const savedTopic = await topic.save();
    
//     // Suscribir automáticamente al nuevo tópico en MQTT
//     this.subscribe(savedTopic.name);

//     return savedTopic;
//   }

//   // Actualizar un tópico
//   async updateTopic(name: string, updateDto) {
//     return this.topicModel.findOneAndUpdate({ name }, updateDto, { new: true });
//   }

//   // Eliminar un tópico
//   async deleteTopic(name: string): Promise<void> {
//     await this.topicModel.deleteOne({ name }).exec();
//   }
// }

import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import * as mqtt from 'mqtt';
import { Server } from 'socket.io';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Topic } from './entities/mqtt.entity';
import { InfluxDB, Point } from '@influxdata/influxdb-client';

@Injectable()
export class MqttService {
  private client: mqtt.MqttClient;
  private io: Server;
  private influxDB: InfluxDB;
  private writeApi;
  private messageBuffer: { topic: string; message: string; updatedAt: Date }[] = [];
  private isProcessing = false;
  private subscribedTopics = new Set<string>();
  private activeTopics = new Set<string>();
  private readonly logger = new Logger(MqttService.name);

  constructor(
    @InjectModel(Topic.name) private topicModel: Model<Topic>,
  ) {
    // Configuración de InfluxDB
    const url = process.env.INFLUXDB_URL || 'http://192.168.78.106:8086';
    const token = process.env.INFLUXDB_TOKEN || 'KI6GdXtQ6Ls9NgbfcvVczf9a6RjSzJykR4avCcWpimlib1Gk95K5ZFYj22t-suTkwTGF2O3iW317oFaIsVAvnA==';
    const org = process.env.INFLUXDB_ORG || 'iot';
    const bucket = process.env.INFLUXDB_BUCKET || 'sensores';

    this.influxDB = new InfluxDB({ url, token });
    this.writeApi = this.influxDB.getWriteApi(org, bucket, 'ns');

    // Conexión a Mosquitto
    this.client = mqtt.connect(process.env.MQTT_URL || 'mqtt://192.168.78.106');

    // Evento de conexión
    this.client.on('connect', async() => {
      this.logger.log('✅ Conectado a Mosquitto');
      await this.findAll();
    });

    // Manejar mensajes recibidos
    this.client.on('message', async (topic, message) => {
      // this.logger.log(`📨 Mensaje recibido en el tópico: ${topic} -> ${message.toString()}`);
      await this.updatePublisher(topic, message.toString());
    });

    // Manejo de errores y desconexión
    this.client.on('error', (err) => {
      this.logger.error(`❌ Error en MQTT: ${err.message}`);
    });

    this.client.on('offline', () => {
      this.logger.warn('⚠️ Cliente MQTT desconectado');
    });

    this.client.on('reconnect', () => {
      this.logger.log('♻️ Intentando reconectar a MQTT...');
    });
  }

  // async onModuleInit() {
  //   await this.findAll();
  // }

  async findAll() {
    this.logger.log('🔄 Restaurando suscripciones MQTT...');
    const topics = await this.topicModel.find();
    topics.forEach((topic) => this.subscribe(topic.name));
    this.logger.log(`✅ Suscrito a ${topics.length} tópicos al iniciar el servidor.`);
    // console.log(topics)

    // Emitir la lista de topics al frontend
 
     
  }

  // Actualizar el publicador y guardar en InfluxDB
  async updatePublisher(topic: string, message: string): Promise<void> {
    const timestamp = new Date();
    this.messageBuffer.push({ topic, message, updatedAt: timestamp });

    if (!this.isProcessing) {
      this.isProcessing = true;
      try {
        for (const msg of this.messageBuffer) {
          const point = new Point('sensores')
            .tag('topic', msg.topic)
            .stringField('message', msg.message)
            .timestamp(msg.updatedAt);

          await this.writeApi.writePoint(point);
          //this.logger.log(`📝 Mensaje guardado en InfluxDB: ${msg.topic} -> ${msg.message}`);
        }

        this.messageBuffer.forEach((msg) => {
          this.io.emit('mqtt_update', {
            topic: msg.topic,
            lastMessage: msg.message,
            updatedAt: msg.updatedAt,
          });
          // console.log(`📤 Mensaje transmitido por WebSocket: ${msg.topic}`);
        });

        this.messageBuffer = []; // Limpiar buffer después de actualizar
      } catch (err) {
        this.logger.error(`❌ Error al procesar mensajes: ${err.message}`);
      } finally {
        this.isProcessing = false;
      }
    }
  }

  // Configurar el servidor de Socket.IO
  setSocketServer(io: Server) {
    this.io = io;

    io.on('connection', (socket) => {
      this.logger.log(`🔗 Nuevo cliente WebSocket conectado: ${socket.id}`);

      socket.on('subscribe', (topic: string) => {
        socket.join(topic);
        this.logger.log(`👥 Cliente suscrito al tópico: ${topic}`);
      });

      socket.on('unsubscribe', (topic: string) => {
        socket.leave(topic);
        this.logger.log(`👋 Cliente desuscrito del tópico: ${topic}`);
      });
    });
  }

  // Publicar un mensaje en un tópico
  publish(topic: string, message: string) {
    console.log(topic, message)
    this.client.publish(topic, message, (err) => {
      if (err) {
        this.logger.error(`❌ Error al publicar en el tópico ${topic}: ${err.message}`);
      } else {
        this.logger.log(`📤 Mensaje publicado en el tópico: ${topic} -> ${message}`);
      }
    });
  }

  // Suscribirse a un tópico
  subscribe(topic: string) {
    if (this.subscribedTopics.has(topic)) {
      this.logger.log(`✅ Ya estás suscrito al tópico: ${topic}`);
      return;
    }

    this.client.subscribe(topic, (err) => {
      if (err) {
        this.logger.error(`❌ Error al suscribirse al tópico ${topic}: ${err.message}`);
      } else {
        this.logger.log(`✅ Suscrito al tópico: ${topic}`);
        this.subscribedTopics.add(topic);
      }
    });
  }

  // Desuscribirse de un tópico
  unsubscribe(topic: string) {
    if (!this.subscribedTopics.has(topic)) {
      this.logger.log(`❌ No estás suscrito al tópico: ${topic}`);
      return;
    }

    this.client.unsubscribe(topic, (err) => {
      if (err) {
        this.logger.error(`❌ Error al desuscribirse del tópico ${topic}: ${err.message}`);
      } else {
        this.logger.log(`❌ Desuscrito del tópico: ${topic}`);
        this.subscribedTopics.delete(topic);
      }
    });
  }

    // Crear un tópico
  async createTopic(createDto) {
    const topic = new this.topicModel(createDto);
    const savedTopic = await topic.save();
    
    // Suscribir automáticamente al nuevo tópico en MQTT
    this.subscribe(savedTopic.name);

    return savedTopic;
  }

  // Actualizar un tópico
  async updateTopic(name: string, updateDto) {
    return this.topicModel.findOneAndUpdate({ name }, updateDto, { new: true });
  }

  // Eliminar un tópico
  async deleteTopic(name: string): Promise<void> {
    await this.topicModel.deleteOne({ name }).exec();
  }
}