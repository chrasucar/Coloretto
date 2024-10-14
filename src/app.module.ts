import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { join } from 'path';
import { config } from 'dotenv';
import { ServeStaticModule } from '@nestjs/serve-static';

// Importaciones de otros contextos

import { User, UserSchema } from './users/user.schema';
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
  providers: [ChatGateway],
})
export class AppModule {}
