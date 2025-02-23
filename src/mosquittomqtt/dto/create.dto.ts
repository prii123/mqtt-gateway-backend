import { IsNotEmpty, IsNumber, IsString, Max, Min } from 'class-validator';

export class CreateEsp32Dto {
  @IsNotEmpty()
  @IsString()
  id: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNumber()
  @Min(0)
  @Max(39)
  connectionLedPin1: number;

  @IsNumber()
  @Min(0)
  @Max(39)
  connectionLedPin2: number;
}


export class CreateDispositivoDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsString()
  topicPub: string;

  @IsNotEmpty()
  @IsString()
  topicSub: string;

  @IsString()
  lastMessage: string = '';

  @IsNumber()
  inputPin?: number; // Se asignará automáticamente

  @IsNumber()
  outputPin?: number; // Se asignará automáticamente

  updatedAt: Date = new Date();
}
