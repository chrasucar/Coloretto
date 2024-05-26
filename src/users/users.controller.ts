import { Controller, Get, Post, Put, Body, Delete, Request, UseGuards,
         Param, HttpStatus, Query, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UsersService } from './users.service';
import { UserValidationException, UserValidationError } from './users-exception';
import { AuthService } from './auth/auth.service'; 
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { User } from './user.schema';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('users')
export class UsersController {

  constructor(private readonly usersService: UsersService,
              private readonly authService: AuthService) {}

  // Paginación y búsqueda.

  // Obtener todos los usuarios.

  @Get()

  async getUsers(@Query('page') page: number, 
                 @Query('limit') limit: number, 
                 @Query('search') search?: string):
                 Promise<{users: User[]; total: number}> {

    const { users, total } = await this.usersService.getUsersPaginationSearch(page, limit, search);

    return { users, total };

  }

  // Visualizar el perfil (protegido: una vez autenticado).

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req) {

    const authHeader = req.headers.authorization;

    if (!authHeader) {

      throw new Error('Token de autorización no proporcionado o incorrecto.');

    }

    const token = authHeader.replace('Bearer ', '');

    const decodedToken = await this.authService.decodeToken(token);

    const userId = decodedToken.sub;

    const user = await this.usersService.findById(userId);

    return user;

  }

  // Registrarse.

  @Post('register')
  async register(
    @Body('fullname') fullname: string,
    @Body('username') username: string,
    @Body('email') email: string,
    @Body('password') password: string) {

    // Validar la longitud de la contraseña.

    if (password.length < 8) {

      throw new UserValidationException(UserValidationError.PasswordShort, HttpStatus.UNPROCESSABLE_ENTITY);

    }

    // Validar si existe ya el usuario o no.

    const existingUserName = await this.usersService.findUserByUserName(username);

    if (existingUserName) {

      throw new UserValidationException(UserValidationError.UsernameTaken, HttpStatus.CONFLICT);

    }

    // Validar si existe ya el email o no.

    const existingUserEmail = await this.usersService.findUserByEmail(email);

    if (existingUserEmail) {

      throw new UserValidationException(UserValidationError.EmailTaken, HttpStatus.CONFLICT);

    }

    const user = await this.usersService.createUser(fullname, username, email, password);

    const token = await this.authService.generateToken(user._id);

    return { message: 'Se ha registrado correctamente.', token };

  }

  // Agregar un contacto.

  @Post('/:username/add-contact')
  async addContact(
    @Param('username') username: string,
    @Body('contact') contact: string) {
  
    await this.usersService.addContact(username, contact);
  
    return { message: 'Usuario agregado correctamente.' };
  
  }

  // Actualizar email.

  @Put('/:username/change-email')
  async changeEmail(
    @Param('username') username: string,
    @Body('newEmail') newEmail: string,) {

  await this.usersService.changeEmail(username, newEmail);

  return { message: 'Correo electrónico actualizado correctamente.' };

}

  // Actualizar contraseña.

  @Put('/:email/change-password')
  async changePassword(
    @Param('email') email: string,
    @Body('currentPassword') currentPassword: string,
    @Body('newPassword') newPassword: string,) {

  await this.usersService.changePassword(email, currentPassword, newPassword);

  return { message: 'Contraseña actualizada correctamente.' };

}

  // Actualizar foto de perfil.

  @Put('/:username/update-profile-picture')
  @UseInterceptors(FileInterceptor('file', {
  storage: diskStorage({
    destination: './uploads/profile-pictures',
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = extname(file.originalname);
      cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
    },
  }),
}))

async updateProfilePicture(
  @Param('username') username: string,
  @UploadedFile() file: Express.Multer.File,) {

  const filePath = `/uploads/profile-pictures/${file.filename}`;

  await this.usersService.updateProfilePicture(username, filePath);

  return { message: 'Foto de perfil actualizada correctamente.', filePath };

}

  // Eliminar todos los usuarios

  @Delete('/')
  async deleteAllUsers() {

    const hasUsers = await this.usersService.areThereAnyUsers();
    
    if (!hasUsers) {

      throw new UserValidationException(UserValidationError.UserEmpty, HttpStatus.NOT_FOUND);

    }

    await this.usersService.deleteAllUsers();

    return { message: 'Todos los usuarios han sido eliminados correctamente.' };

  }

  // Eliminar un usuario

  @Delete('/:username')
  async deleteUser(@Param('username') username: string) {

    await this.usersService.deleteUser(username);

    return { message: 'Usuario eliminado correctamente.' };

  }

  // Eliminar contactos: Eliminar uno.

  @Delete('/:username/delete-contact')
  async removeContact(
    @Param('username') username: string,
    @Body('contact') contact: string) {

    await this.usersService.deleteContact(username, contact);

    return { message: 'Usuario eliminado correctamente.' };
    
  }

}
