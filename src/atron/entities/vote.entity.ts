import { IsInt } from 'class-validator';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Column, Entity } from 'typeorm';

@Entity()
export class Vote extends CoreEntity {
  @Column()
  @IsInt()
  amount: number;
}
