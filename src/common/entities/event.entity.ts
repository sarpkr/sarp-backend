import { IsInt, IsNumberString, IsString } from 'class-validator';

import { Column, Entity } from 'typeorm';
import { CoreEntity } from './core.entity';

@Entity()
export class EventEntity extends CoreEntity {
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
  @IsString()
  transaction: string;
}
