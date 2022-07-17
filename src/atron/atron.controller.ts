import { Controller } from '@nestjs/common';
import { AtronService } from './atron.service';

@Controller('atron')
export class AtronController {
  constructor(private readonly atronService: AtronService) {}
}
