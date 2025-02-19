import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UrlServerMQTT } from './entities/urlmqtt.entity'; 

@Injectable()
export class UrlServerMqttService {
  constructor(@InjectModel(UrlServerMQTT.name) private urlServerMqttModel: Model<UrlServerMQTT>) {}

  async create(createUrlServerMqttDto: any): Promise<UrlServerMQTT> {
    const createdUrlServerMqtt = new this.urlServerMqttModel(createUrlServerMqttDto);
    return createdUrlServerMqtt.save();
  }

  async findAll(): Promise<UrlServerMQTT[]> {
    return this.urlServerMqttModel.find().exec();
  }
}