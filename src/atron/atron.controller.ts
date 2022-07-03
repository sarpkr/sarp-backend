import { Controller, Get, Post } from '@nestjs/common';
import { AtronService } from './atron.service';

@Controller('atron')
export class AtronController {
  constructor(private readonly atronService: AtronService) {}
  //   @Post('stake')
  //   stake() {
  //     this.atronService.stake();
  //   }
}
