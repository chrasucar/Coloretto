import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { config } from 'dotenv';
import { UsersModule } from './users/users.module';
import { GameModule } from './game/game.module';
import { AuthModule } from './users/auth/auth.module';
import { User, UserSchema } from './users/user.schema';
import { UsersController } from './users/users.controller';
import { UsersService } from './users/users.service';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

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

  controllers: [UsersController],
  providers: [UsersService],
  
})

export class AppModule {}
