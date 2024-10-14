import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Game, GameSchema } from './game.schema';
import { GameService } from './game.service';
import { GameController } from './game.controller';
import { UsersModule } from '../users/users.module';
import { GameGateway } from './game.gateway';
import { Card, CardSchema, Column, ColumnSchema } from './card/card.schema';
import { AiModule } from './ai.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Game.name, schema: GameSchema }]),
    MongooseModule.forFeature([{ name: Column.name, schema: ColumnSchema }]),
    MongooseModule.forFeature([{ name: Card.name, schema: CardSchema }]),
    UsersModule,
    AiModule,
  ],
  providers: [GameService, GameGateway],
  controllers: [GameController],
  exports: [GameService]
})
export class GameModule {}
