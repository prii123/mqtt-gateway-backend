import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateConfigDto {
  @IsNotEmpty()
  @IsString()
  wifi: string;

  @IsNotEmpty()
  @IsString()
  pass: string;
}


export class UrlServerMQTT {
  @IsNotEmpty()
  @IsString()
  url: string;

  @IsNotEmpty()
  @IsNumber()
  port: number;

  @IsNotEmpty()
  @IsString()
  username: string;

  @IsNotEmpty()
  @IsString()
  password: string;
  
}


