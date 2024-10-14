import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { config } from 'dotenv';

// Importaciones de otros contextos

import { User, UserSchema } from './users/user.schema';
import { UsersModule } from './users/users.module';
import { AuthModule } from './users/auth/auth.module';
import { ChatGateway } from './chats/chat.gateway';
import { MessageModule } from './messages/message.module';
import { GameModule } from './games/game.module';
import { UploadService } from './users/upload.service'; 

config();

@Module({
  imports: [
    MongooseModule.forRoot(process.env.MONGODB_URI),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    UsersModule,
    AuthModule,
    MessageModule,
    GameModule,
  ],
  providers: [ChatGateway, UploadService],
})
export class AppModule {}
