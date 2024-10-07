import { HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from './user.schema';
import {
  UserValidationException,
  UserValidationError,
} from './users-exception';
import * as mongoose from 'mongoose';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  // Obtener todos los usuarios.

  async getAllUsers(): Promise<User[]> {
    return this.userModel.find().exec();
  }

  // Obtener todos los nombres de usuarios.

  async getAllUsernames(): Promise<string[]> {
    const users = await this.userModel.find().select('username').exec();
    return users.map(user => user.username);
  }

  // Verificar si hay usuarios en la base de datos.

  async areThereAnyUsers(): Promise<boolean> {
    const count = await this.userModel.countDocuments().exec();
  
    return count > 0;
  }

  // Crear un usuario nuevo.

  async createUser(
    fullname: string,
    username: string,
    email: string,
    password: string,
    profilePicture: string,
  ): Promise<User> {
  
      // Validar la longitud de la contraseña.
  
      if (password.length < 8) {
        throw new UserValidationException(
          UserValidationError.PasswordShort,
          HttpStatus.LENGTH_REQUIRED,
        );
      }
  
      // Validar si existe ya el usuario o no.
  
      const existingUserName = await this.findUserByUserName(username);
  
      if (existingUserName) {
        throw new UserValidationException(
          UserValidationError.UsernameTaken,
          HttpStatus.CONFLICT,
        );
      }
  
      // Validar si existe ya el email o no.
  
      const existingUserEmail = await this.findUserByEmail(email);
  
      if (existingUserEmail) {
        throw new UserValidationException(
          UserValidationError.EmailTaken,
          HttpStatus.CONFLICT,
        );
      }

      const newUser = new this.userModel({
        _id: new mongoose.Types.ObjectId(),
        fullname,
        username,
        email,
        password,
        profilePicture
      });

    return newUser.save();
    
  }

  // Encontrar un usuario por su id.

  async findById(_id: string): Promise<User | undefined> {
    return this.userModel.findOne({ _id }).exec();
  }

  // Encontrar un usuario por su nombre de usuario.

  async findUserByUserName(username: string): Promise<User | undefined> {
    return this.userModel.findOne({ username }).exec();
  }

  // Encontrar todos los usuarios por sus nombres de usuario.

  async findUserIdsByUsernames(usernames: string[]): Promise<Types.ObjectId[]> {
    const userIds = await this.userModel.find({ username: { $in: usernames } }).select('_id').exec();
    if (userIds.length !== usernames.length) {
      throw new NotFoundException('Uno o mas usuarios no han sido encontrados por id.');
    }
    return userIds.map(user => new Types.ObjectId(user._id));
  }

  // Encontrar un usuario por su correo electrónico.

  async findUserByEmail(email: string): Promise<User | undefined> {
    return this.userModel.findOne({ email }).exec();
  }

  // Actualizar email.

  async changeEmail(username: string, password: string, newEmail: string) {

    const user = await this.userModel.findOne({ username });

    if (!user) {
      throw new UserValidationException(
        UserValidationError.UserNotFound,
        HttpStatus.NOT_FOUND,
      );
    }

    if (user.password !== password) {
      throw new UserValidationException(
        UserValidationError.PasswordNotFound,
        HttpStatus.NOT_FOUND,
      );
    }

    if (user.email === newEmail) {
      throw new UserValidationException(
        UserValidationError.EmailSame,
        HttpStatus.CONFLICT,
      );
    }

    user.email = newEmail;

    await user.save();

  }

  // Actualizar contraseña.

  async changePassword(username: string, currentPassword: string, newPassword: string, verifyPassword: string) {

    const user = await this.userModel.findOne({ username });

    if (!user) {
      throw new UserValidationException(
        UserValidationError.UserNotFound,
        HttpStatus.NOT_FOUND,
      );
    }

    if (currentPassword !== user.password) {
      throw new UserValidationException(
        UserValidationError.PasswordNotFound,
        HttpStatus.NOT_FOUND,
      );
    }

    if (newPassword === currentPassword) {
      throw new UserValidationException(
        UserValidationError.PasswordSame,
        HttpStatus.CONFLICT,
      );
    }

    if (newPassword !== verifyPassword) {
      throw new UserValidationException(
        UserValidationError.PasswordNotEqual,
        HttpStatus.BAD_REQUEST,
      );
    }

    user.password = newPassword;

    await user.save();

  }

  // Actualizar foto de perfil.

  async updateProfilePicture(
    username: string,
    profilePicturePath: string,
  ) {
    const user = await this.userModel.findOne({ username });

    if (!user) {
      throw new UserValidationException(
        UserValidationError.UserNotFound,
        HttpStatus.NOT_FOUND,
      );
    }

    if (profilePicturePath) {

      // Si no se proporciona una URL, se actualiza la foto de perfil con la ruta del archivo.

      user.profilePicture = profilePicturePath;

    }

    await user.save();
  }

  // Actualizar tiempo de conexión del usuario.

  async updateConnectionStartTime(userId: string, startTime: Date): Promise<void> {

    try {
      const user = await this.userModel.findById(userId);

      if (!user) {
        throw new UserValidationException(
          UserValidationError.UserNotFound,
          HttpStatus.UNAUTHORIZED,
        );
      }

      user.connectionStartTime = startTime;

      await user.save();
    } 
    
    catch (error) {

      throw new Error('Error actualizando el tiempo de conexión del usuario.');

    }
  }

  // Actualizar última vez que se conectó el usuario.

  async updateLastSeen(username: string, lastSeen: Date | null, isOnline: boolean): Promise<void> {
    try {
      const user = await this.userModel.findOne({ username }).exec();

      if (!user) {
        throw new Error('Usuario no encontrado.');
      }

      user.lastSeen = lastSeen;
      user.isOnline = isOnline;
      await user.save();

    } catch (error) {
      throw new Error('Error al actualizar lastSeen en updateLastSeen.');
    }
  }

  // Eliminar un usuario por su nombre de usuario.

  async deleteUser(username: string): Promise<void> {
    const result = await this.userModel.deleteOne({ username }).exec();

    if (result.deletedCount === 0) {
      throw new UserValidationException(
        UserValidationError.UserNotFound,
        HttpStatus.NOT_FOUND,
      );
    }
  }
}
