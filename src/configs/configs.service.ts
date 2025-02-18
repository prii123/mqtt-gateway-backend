import { Injectable } from '@nestjs/common';
import { CreateConfigDto } from './dto/create-config.dto';
import { WifiPass, WifiPassDocument } from './entities/config.entity';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class ConfigsService {
  constructor(
    @InjectModel(WifiPass.name) private wifiPassModel: Model<WifiPassDocument>,
  ){}

  async create(createConfigDto: CreateConfigDto) {
    const { wifi, pass } = createConfigDto;

    // Buscar si ya existe la configuración
    const existingConfig = await this.wifiPassModel.findOne({ wifi });

    if (existingConfig) {
      // Si existe, actualizar la contraseña
      existingConfig.pass = pass;
      await existingConfig.save();
      return { message: 'WiFi password updated successfully', data: existingConfig };
    } else {
      // Si no existe, crear un nuevo registro
      const newConfig = new this.wifiPassModel({ wifi, pass });
      await newConfig.save();
      return { message: 'WiFi credentials saved successfully', data: newConfig };
    }
  }

  async findAll() {
    return await this.wifiPassModel.find();
  }


}
