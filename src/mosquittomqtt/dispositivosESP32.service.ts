import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Esp32, RESERVED_PINS } from './entities/dispositivos.entity';
import { CreateDispositivoDto, CreateEsp32Dto } from './dto/create.dto';

@Injectable()
export class Esp32Service {
  constructor(@InjectModel(Esp32.name) private readonly esp32Model: Model<Esp32>) {}

  async createEsp32(data: CreateEsp32Dto) {
    return this.esp32Model.create(data);
  }

  async getEsp32ById(id: string) {
    const esp32 = await this.esp32Model.findOne({ id }).exec();
    if (!esp32) throw new NotFoundException(`ESP32 con ID ${id} no encontrada`);
    return esp32;
  }

  async AllEsp32() {
    const esp32 = await this.esp32Model.find().exec();
    if (!esp32) throw new NotFoundException(`ESP32 sin datos`);
    return esp32;
  }

  async addDispositivo(esp32Id: string, dispositivoData: CreateDispositivoDto) {
    const esp32 = await this.getEsp32ById(esp32Id);

    if (esp32.dispositivos.length >= 6) {
      throw new BadRequestException('Máximo número de dispositivos alcanzado');
    }

    // Obtener pines ya usados
    const usedPins = new Set<number>();
    esp32.dispositivos.forEach(d => {
      usedPins.add(d.inputPin);
      usedPins.add(d.outputPin);
    });

    let inputPin = 32;
    let outputPin = 33;
    while (usedPins.has(inputPin) || usedPins.has(outputPin) || RESERVED_PINS.has(inputPin) || RESERVED_PINS.has(outputPin)) {
      inputPin -= 2;
      outputPin -= 2;
      if (inputPin < 0 || outputPin < 0) throw new BadRequestException('No hay pines disponibles');
    }

    // dispositivoData.inputPin = inputPin;
    // dispositivoData.outputPin = outputPin;
    // dispositivoData.updatedAt = new Date();
    // dispositivoData.lastMessage = "";
     const dispo = {
      ...dispositivoData, 
      inputPin,
      outputPin
     }
  

    esp32.dispositivos.push(dispo);
    await esp32.save();
    return esp32;
  }
}
