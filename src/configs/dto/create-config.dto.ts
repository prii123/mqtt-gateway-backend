import { IsNotEmpty, IsString } from 'class-validator';

export class CreateConfigDto {
  @IsNotEmpty()
  @IsString()
  wifi: string;

  @IsNotEmpty()
  @IsString()
  pass: string;
}
