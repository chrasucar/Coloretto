import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { join } from 'path';
import { config } from 'dotenv';
import { AppController } from './app.controller';
import { ServeStaticModule } from '@nestjs/serve-static';

// Importaciones de otros contextos

import { User, UserSchema } from './users/user.schema';
import { UsersController } from './users/users.controller';
import { UsersService } from './users/users.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './users/auth/auth.module';
import { ChatGateway } from './chats/chat.gateway';
import { MessageModule } from './messages/message.module';
import { GameModule } from './games/game.module';

config();

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGODB_URI),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),
    UsersModule,
    AuthModule,
    MessageModule,
    GameModule,
  ],
  controllers: [UsersController, AppController],
  providers: [UsersService, ChatGateway],
})
export class AppModule {}
