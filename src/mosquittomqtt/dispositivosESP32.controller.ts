// import { Controller, Post, Get, Param, Body } from '@nestjs/common';
// import { Esp32Service } from './dispositivosESP32.service';

// @Controller('esp32')
// export class Esp32Controller {
//   constructor(private readonly esp32Service: Esp32Service) {}

//   @Post()
//   async createEsp32(@Body() data: any) {
//     return this.esp32Service.createEsp32(data);
//   }

//   @Get(':id')
//   async getEsp32(@Param('id') id: string) {
//     return this.esp32Service.getEsp32ById(id);
//   }

//   @Post(':id/dispositivo')
//   async addDispositivo(@Param('id') id: string, @Body() data: any) {
//     return this.esp32Service.addDispositivo(id, data);
//   }
// }



import { Controller, Post, Get, Param, Body } from '@nestjs/common';
import { Esp32Service } from './dispositivosESP32.service';
import { CreateEsp32Dto, CreateDispositivoDto } from './dto/create.dto';

@Controller('esp32')
export class Esp32Controller {
  constructor(private readonly esp32Service: Esp32Service) {}

  @Post()
  async createEsp32(@Body() dto: CreateEsp32Dto) {
    return this.esp32Service.createEsp32(dto);
  }

  @Get()
  async allEsp32() {
    return this.esp32Service.AllEsp32();
  }

  @Get(':id')
  async getEsp32(@Param('id') id: string) {
    console.log("llamada eps32 --- " +id)
    return this.esp32Service.getEsp32ById(id);
  }

  @Post(':id/dispositivo')
  async addDispositivo(@Param('id') id: string, @Body() dto: CreateDispositivoDto) {
    return this.esp32Service.addDispositivo(id, dto);
  }
}

