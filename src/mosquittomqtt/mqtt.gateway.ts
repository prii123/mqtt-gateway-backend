import { WebSocketGateway, WebSocketServer, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MqttService } from './mosquittomqtt.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Topic } from './entities/mqtt.entity';

@WebSocketGateway({ cors: true })
export class MqttGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  constructor(
    private readonly mqttService: MqttService,
    @InjectRepository(Topic)
    private readonly topicRepository: Repository<Topic>,
  ) {}


  afterInit(server: Server) {
    console.log('🚀 WebSocket Gateway Inicializado');
    this.mqttService.setSocketServer(server);
  }

  handleConnection(client: Socket) {
    console.log(`✅ Cliente conectado: ${client.id}`);
    console.log('Dirección IP:', client.handshake.address);
    // console.log('Headers:', client.handshake.headers);
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
    const topic = await this.topicRepository.findOne({ where: { name: topicName } });

    if (topic) {
      topic.subscriptionCount += change;
      await this.topicRepository.save(topic);
    } else if (change > 0) {
      // Si el tópico no existe y es una suscripción, crea un nuevo registro
      const newTopic = this.topicRepository.create({ name: topicName, subscriptionCount: 1 });
      await this.topicRepository.save(newTopic);
    }
  }




}
