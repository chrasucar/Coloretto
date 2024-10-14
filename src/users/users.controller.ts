import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Delete,
  Param,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UsersService } from './users.service';
import { AuthService } from './auth/auth.service';
import { UploadService } from './upload.service';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
    private readonly uploadService: UploadService
  ) {}

  // Obtener todos los usuarios por nombre de usuario.

  @Get('/usernames')
  async getAllUsernames(): Promise<string[]> {
    try {
      const usernames = await this.usersService.getAllUsernames();
      return usernames;
    } catch (error) {
      throw new Error('Error al obtener los nombres de usuario.');
    }
  }

  // Visualizar el perfil (protegido: una vez autenticado).

  @Get('profile/:username')
  async getProfile(@Param('username') username: string) {
    const user = await this.usersService.findUserByUserName(username);

    if (!user) {
      return null;
    }

    return user;
  }

  // Registrarse.

  @Post('register')
  async register(
    @Body('fullname') fullname: string,
    @Body('username') username: string,
    @Body('email') email: string,
    @Body('password') password: string,
  ) {

    const profilePicture = 'https://res.cloudinary.com/dtrjovuji/image/upload/v1728909714/wjdzq2scuj9fc16ctrnt.png';

    const user = await this.usersService.createUser(
      fullname,
      username,
      email,
      password,
      profilePicture,
    );

    const token = await this.authService.generateToken(user._id);

    return { message: 'Se ha registrado correctamente.', token };
  }

  // Actualizar email.

  @Put('/profile/:username/change-email')
  async changeEmail(
    @Param('username') username: string,
    @Body('password') password: string,
    @Body('newEmail') newEmail: string,
  ) {

    await this.usersService.changeEmail(username, password, newEmail);

    return { message: 'Correo electrónico actualizado correctamente.' };

  }
  
  // Actualizar contraseña.

  @Put('/profile/:username/change-password')
  async changePassword(
    @Param('username') username: string,
    @Body('currentPassword') currentPassword: string,
    @Body('newPassword') newPassword: string,
    @Body('verifyPassword') verifyPassword: string,
  ) {
  
    await this.usersService.changePassword(username, currentPassword, newPassword, verifyPassword);

    return { message: 'Contraseña actualizada correctamente.' };

    }

  // Actualizar foto de perfil.

  @Put('/profile/:username/update-profile-picture')
  @UseInterceptors(FileInterceptor('file'))

  async updateProfilePicture(@Param('username') username: string, @UploadedFile() file: Express.Multer.File) {

    let filePath = '';

    if (file) {

      const fileUrl = await this.uploadService.uploadFile(file);

      filePath = fileUrl;
    } 
    
    else {

      throw new Error('Debe proporcionar un archivo válido.');

    }

    const res = await this.usersService.updateProfilePicture(username, filePath);

    return { message: 'Foto de perfil actualizada correctamente.', res };

  }

  // Eliminar un usuario

  @Delete('/:username')
  async deleteUser(@Param('username') username: string) {
    await this.usersService.deleteUser(username);

    return { message: 'Usuario eliminado correctamente.' };
  }
}
