import { Module, forwardRef } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './user.schema';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { AuthModule } from './auth/auth.module';
import { UploadService } from './upload.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    forwardRef(() => AuthModule)
  ],

  providers: [UsersService, UploadService],
  controllers: [UsersController],
  exports: [UsersService, MongooseModule.forFeature([{ name: User.name, schema: UserSchema }])],

})

export class UsersModule {}
