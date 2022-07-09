import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';

import * as Joi from 'joi';
import { AtronModule } from './atron/atron.module';
import { BuyTokenEvent } from './atron/entities/buy-token-event.entity';
import { StakeLog } from './atron/entities/stake-log.entity';
import { VoteLog } from './atron/entities/vote-log.entity';
import { Vote } from './atron/entities/vote.entity';
import { CommonModule } from './common/common.module';
import { CronModule } from './cron/cron.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        NODE_ENV: Joi.string().valid('development', 'production').required(),
        PORT: Joi.number().required(),
        DB_HOST: Joi.string().required(),
        DB_PORT: Joi.number().required(),
        DB_USER: Joi.string().required(),
        DB_PASS: Joi.string().required(),
        DB_DATABASE: Joi.string().required(),
      }),
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: configService.get('DB_PORT'),
        username: configService.get('DB_USER'),
        password: configService.get('DB_PASS'),
        database: configService.get('DB_DATABASE'),
        entities: [BuyTokenEvent, Vote, VoteLog, StakeLog],
        logging: true,
        synchronize: true,
      }),
    }),
    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot(),
    CommonModule,
    AtronModule,
    CronModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
