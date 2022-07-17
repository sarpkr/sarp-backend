import { IsNumberString, IsString } from 'class-validator';
import { EventEntity } from 'src/common/entities/event.entity';
import { Column, Entity } from 'typeorm';

@Entity()
export class ExchangeTokenEvent extends EventEntity {
  @Column()
  @IsNumberString()
  tokenAmountToExchange: string;

  @Column()
  @IsString()
  buyer: string;

  @Column()
  @IsString()
  remainAmount: string;
}
