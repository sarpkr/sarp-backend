import { IsInt, IsNumberString, IsString } from 'class-validator';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Column, Entity } from 'typeorm';

@Entity()
export class BuyTokenEvent extends CoreEntity {
  @Column()
  @IsString()
  contract: string;

  @Column({ type: 'bigint' })
  @IsNumberString()
  timestamp: string;

  @Column()
  @IsInt()
  block: number;

  @Column()
  @IsNumberString()
  amountOfTokens: string;

  @Column()
  @IsNumberString()
  amountOfTRX: string;

  @Column()
  @IsString()
  buyer: string;

  @Column()
  @IsString()
  transaction: string;
}
