import { Test, TestingModule } from '@nestjs/testing';
import { MosquittomqttService } from './mosquittomqtt.service';

describe('MosquittomqttService', () => {
  let service: MosquittomqttService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MosquittomqttService],
    }).compile();

    service = module.get<MosquittomqttService>(MosquittomqttService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
