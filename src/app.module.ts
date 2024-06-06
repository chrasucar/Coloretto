import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { join } from 'path';
import { config } from 'dotenv';
import { AppController } from './app.controller';
import { ServeStaticModule } from '@nestjs/serve-static';

// Usuarios

import { User, UserSchema } from './users/user.schema';
import { UsersController } from './users/users.controller';
import { UsersService } from './users/users.service';
import { UsersModule } from './users/users.module';

// Juego

import { GameModule } from './game/game.module';
import { AuthModule } from './users/auth/auth.module';
import { GameController } from './game/game.controller';


config();

@Module({
  imports: [MongooseModule.forRoot(process.env.MONGODB_URI),
            MongooseModule.forFeature([{ name: User.name, schema: UserSchema}]),
            ServeStaticModule.forRoot({
              rootPath: join(__dirname, '..', 'uploads'),
              serveRoot: '/uploads',
            }),
            UsersModule,
            AuthModule,
            GameModule,
  ],

  controllers: [UsersController, GameController, AppController],
  providers: [UsersService],
  
})

export class AppModule {}
