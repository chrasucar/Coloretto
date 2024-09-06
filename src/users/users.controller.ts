import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Delete,
  Param,
  HttpStatus,
  Query,
  UploadedFile,
  UseInterceptors,
  HttpException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UsersService } from './users.service';
import {
  UserValidationException,
  UserValidationError,
} from './users-exception';
import { AuthService } from './auth/auth.service';
import { User } from './user.schema';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
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
      throw new UserValidationException(
        UserValidationError.UserNotFound,
        HttpStatus.UNAUTHORIZED,
      );
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
    // Validar la longitud de la contraseña.

    if (password.length < 8) {
      throw new UserValidationException(
        UserValidationError.PasswordShort,
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    // Validar si existe ya el usuario o no.

    const existingUserName =
      await this.usersService.findUserByUserName(username);

    if (existingUserName) {
      throw new UserValidationException(
        UserValidationError.UsernameTaken,
        HttpStatus.CONFLICT,
      );
    }

    // Validar si existe ya el email o no.

    const existingUserEmail = await this.usersService.findUserByEmail(email);

    if (existingUserEmail) {
      throw new UserValidationException(
        UserValidationError.EmailTaken,
        HttpStatus.CONFLICT,
      );
    }

    const user = await this.usersService.createUser(
      fullname,
      username,
      email,
      password,
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
    try {
      await this.usersService.changeEmail(username, password, newEmail);
      return { message: 'Correo electrónico actualizado correctamente.' };
    } catch (error) {
      if (error instanceof UserValidationException) {
        // Si ya es una excepción personalizada, lanzarla nuevamente
        throw error;
      } else if (error.response) {
        // Si hay una respuesta en el error
        const { status } = error.response;
        switch (status) {
          case HttpStatus.CONFLICT:
            // Si es un conflicto de correo electrónico.
            throw new UserValidationException(
              UserValidationError.EmailSame,
              HttpStatus.CONFLICT,
            );
          case HttpStatus.NOT_FOUND:
            // Si no se encuentra el usuario.
            throw new UserValidationException(
              UserValidationError.UserNotFound,
              HttpStatus.NOT_FOUND,
            );
          default:
            // Para otros errores de respuesta.
            throw new Error(
              'Error inesperado al actualizar el correo electrónico.',
            );
        }
      } else {
        // Para otros errores no relacionados con la respuesta.
        throw new Error(
          'Error inesperado al actualizar el correo electrónico.',
        );
      }
    }
  }

  // Actualizar contraseña.

  @Put('/profile/:username/change-password')
  async changePassword(
    @Param('username') username: string,
    @Body('currentPassword') currentPassword: string,
    @Body('newPassword') newPassword: string,
    @Body('verifyPassword') verifyPassword: string,
  ) {
    try {
      await this.usersService.changePassword(
        username,
        currentPassword,
        newPassword,
        verifyPassword
      );

      return { message: 'Contraseña actualizada correctamente.' };
    } catch (error) {
      if (error instanceof UserValidationException) {
        // Si ya es una excepción personalizada, lanzarla nuevamente.
        throw error;
      } else if (error.response) {
        // Si hay una respuesta en el error.
        const { status } = error.response;
        switch (status) {
          case HttpStatus.CONFLICT:
            // Si es un conflicto de contraseña.
            throw new UserValidationException(
              UserValidationError.EmailSame,
              HttpStatus.CONFLICT,
            );
          case HttpStatus.NOT_FOUND:
            // Si no se encuentra el usuario.
            throw new UserValidationException(
              UserValidationError.UserNotFound,
              HttpStatus.NOT_FOUND,
            );
          default:
            // Para otros errores de respuesta.
            throw new Error('Error inesperado al actualizar la contraseña.');
        }
      } else {
        // Para otros errores no relacionados con la respuesta.
        throw new Error('Error inesperado al actualizar la contraseña.');
      }
    }
  }

  // Actualizar perfil.

  @Put(':username/update-profile-picture')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/profile-pictures',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
        },
      }),
    }),
  )
  async updateProfilePicture(
    @Param('username') username: string,
    @UploadedFile() file: Express.Multer.File,
    @Body('imageUrl') imageUrl: string,
  ) {
    let filePath = '';

    if (file) {
      filePath = `/uploads/profile-pictures/${file.filename}`;

    } else if (imageUrl) {

      filePath = imageUrl;

    } else {
      throw new Error(
        'Debe proporcionar un archivo o una URL de imagen válida.',
      );
    }

    // Llamar al servicio para actualizar la foto de perfil con la ruta de la imagen.
    await this.usersService.updateProfilePicture(username, filePath);

    // Devolver un mensaje de éxito junto con la ruta de la imagen actualizada.
    return { message: 'Foto de perfil actualizada correctamente.', filePath };
  }

  // Eliminar un usuario

  @Delete('/:username')
  async deleteUser(@Param('username') username: string) {
    await this.usersService.deleteUser(username);

    return { message: 'Usuario eliminado correctamente.' };
  }
}
