import { IsNumberString, IsString } from 'class-validator';
import { EventEntity } from 'src/common/entities/event.entity';
import { Column, Entity } from 'typeorm';

@Entity()
export class BuyTokenEvent extends EventEntity {
  @Column()
  @IsNumberString()
  amountOfTokens: string;

  @Column()
  @IsNumberString()
  amountOfTRX: string;

  @Column()
  @IsString()
  buyer: string;
}
