import { WebSocketGateway, WebSocketServer, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MqttService } from './mosquittomqtt.service';
import { Topic, TopicDocument } from './entities/mqtt.entity';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';


@WebSocketGateway({ cors: true })
export class MqttGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  constructor(
    private readonly mqttService: MqttService,
    @InjectModel(Topic.name) private topicModel: Model<TopicDocument>,
  ) {}


  afterInit(server: Server) {
    console.log('🚀 WebSocket Gateway Inicializado');
    this.mqttService.setSocketServer(server);
  }

  handleConnection(client: Socket) {
    console.log(`✅ Cliente conectado: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`❌ Cliente desconectado: ${client.id}`);

     // Obtener los tópicos a los que estaba suscrito
     const topics = Array.from(client.rooms);
     topics.forEach((topic) => {
       if (topic !== client.id) { // Ignorar la sala propia del cliente
         console.log(`Desuscribiendo al cliente de ${topic}`);
         // Aquí puedes actualizar la base de datos o realizar otras acciones
       }
     });
  }



  @SubscribeMessage('publish')
  async handlePublish(client: Socket, payload: { topic: string; message: string }) {
    const { topic, message } = payload;
    const ipAddress = client.handshake.address;

    console.log(payload)

    // // Actualizar la base de datos con el último mensaje publicado
    // await this.mqttService.updatePublisher(topic, ipAddress, message);

    // // Emitir el mensaje a todos los suscriptores del tópico
    // this.server.to(topic).emit('message', { topic, message });

    // console.log(`📤 Mensaje publicado en ${topic} por ${ipAddress}: ${message}`);
  }


  @SubscribeMessage('subscribe')
  async handleSubscribe(client: Socket, topic: string) {
    console.log(`✅ Cliente ${client.id} se suscribió a ${topic}`);

     // Actualizar la base de datos con la nueva suscripción
     await this.updateTopicSubscriptionCount(topic, 1);

    // Contar suscriptores por tópico
    const topicSubscribers = this.countSubscribers();
    console.log('Número de suscriptores por tópico:', topicSubscribers);
  }

  @SubscribeMessage('unsubscribe')
  async handleUnsubscribe(client: Socket, topic: string) {
    console.log(`❌ Cliente ${client.id} se desuscribió de ${topic}`);

    // Actualizar la base de datos con la desuscripción
    await this.updateTopicSubscriptionCount(topic, -1);
   
    // Contar suscriptores por tópico
    const topicSubscribers = this.countSubscribers();
    console.log('Número de suscriptores por tópico:', topicSubscribers);
  }

  // Método para contar suscriptores por tópico
  countSubscribers(): Map<string, number> {
    const topicSubscribers = new Map<string, number>();

    this.server.sockets.sockets.forEach((client) => {
      const topics = Array.from(client.rooms);
      topics.forEach((topic) => {
        if (topic !== client.id) { // Ignorar la sala propia del cliente
          const count = topicSubscribers.get(topic) || 0;
          topicSubscribers.set(topic, count + 1);
        }
      });
    });

    return topicSubscribers;
  }



  // Método para actualizar el contador de suscripciones en la base de datos
  private async updateTopicSubscriptionCount(topicName: string, change: number): Promise<void> {
    const topic = await this.topicModel.findOne({ where: { name: topicName } });

    if (topic) {
      topic.subscriptionCount += change;
      await this.topicModel.create({name: topicName});
    } else if (change > 0) {
      // Si el tópico no existe y es una suscripción, crea un nuevo registro
      const newTopic = await this.topicModel.updateOne({ name: topicName, subscriptionCount: 1 });
      console.log(newTopic)
    }
  }




}
