import { IsBoolean, IsString } from 'class-validator';
import { CoreEntity } from 'src/common/entities/core.entity';
import { Column, Entity } from 'typeorm';

@Entity()
export class DistributionLog extends CoreEntity {
  @Column()
  @IsBoolean()
  result: boolean;

  @Column()
  @IsString()
  address: string;

  @Column()
  @IsString()
  txId: string;
}
