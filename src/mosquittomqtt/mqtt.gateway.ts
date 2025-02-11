import { WebSocketGateway, WebSocketServer, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MqttService } from './mosquittomqtt.service';

@WebSocketGateway({ cors: true })
export class MqttGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  constructor(private readonly mqttService: MqttService) {}

  afterInit(server: Server) {
    console.log('🚀 WebSocket Gateway Inicializado');
    this.mqttService.setSocketServer(server);
  }

  handleConnection(client: Socket) {
    console.log(`✅ Cliente conectado: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`❌ Cliente desconectado: ${client.id}`);
  }
}
