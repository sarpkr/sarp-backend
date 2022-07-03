import { IsBoolean, IsInt, IsString } from 'class-validator';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Column, Entity } from 'typeorm';

@Entity()
export class VoteLog extends CoreEntity {
  @Column()
  @IsBoolean()
  result: boolean;

  @Column()
  @IsString()
  txid: string;

  @Column()
  @IsInt()
  amount: number;
}
