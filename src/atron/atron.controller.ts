import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller('atron')
export class AtronController {
  @MessagePattern('claim')
  claim(@Payload() data: object) {
    console.log(data, 'claim');
  }

  @MessagePattern('transfer')
  transfer(@Payload() data: object) {
    console.log(data, 'transfer');
  }
}
