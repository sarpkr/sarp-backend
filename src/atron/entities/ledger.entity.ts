import { IsString } from 'class-validator';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Column, Entity } from 'typeorm';

@Entity()
export class Ledger extends CoreEntity {
  @Column()
  @IsString()
  sender: string;

  @Column()
  amount: number;
}
