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


  @SubscribeMessage('subscribe')
  async handleSubscribe(client: Socket, topic: string) {
    console.log(`✅ Cliente ${client.id} se suscribió a ${topic}`);

    // Contar suscriptores por tópico
    // const topicSubscribers = this.countSubscribers();
    // console.log('Número de suscriptores por tópico:', topicSubscribers);
  }

  @SubscribeMessage('unsubscribe')
  async handleUnsubscribe(client: Socket, topic: string) {
    console.log(`❌ Cliente ${client.id} se desuscribió de ${topic}`);
    console.log('Número de suscriptores por tópico:');
  }

  // Método para contar suscriptores por tópico
  // countSubscribers(): Map<string, number> {
  //   const topicSubscribers = new Map<string, number>();

  //   this.server.sockets.sockets.forEach((client) => {
  //     const topics = Array.from(client.rooms);
  //     topics.forEach((topic) => {
  //       if (topic !== client.id) { // Ignorar la sala propia del cliente
  //         const count = topicSubscribers.get(topic) || 0;
  //         topicSubscribers.set(topic, count + 1);
  //       }
  //     });
  //   });

  //   return topicSubscribers;
  // }

}
