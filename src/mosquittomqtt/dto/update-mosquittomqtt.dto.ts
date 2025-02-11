import { PartialType } from '@nestjs/mapped-types';
import { CreateMosquittomqttDto } from './create-mosquittomqtt.dto';

export class UpdateMosquittomqttDto extends PartialType(CreateMosquittomqttDto) {}
