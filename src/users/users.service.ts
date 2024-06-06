import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
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

  // Obtener usuarios con paginación y búsqueda opcional.

  async getUsersPaginationSearch(
    page: number,
    limit: number,
    search?: string,
  ): Promise<{ users: User[]; total: number }> {
    const skip = (page - 1) * limit;
    const filter: any = {};

    if (search) {
      filter.$or = [
        { fullname: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } },
      ];
    }

    const usersPromise = this.userModel
      .find(filter)
      .skip(skip)
      .limit(limit)
      .collation({ locale: 'es', strength: 2 }) // Ignorar mayúsculas y minúsculas
      .sort({ fullname: 1, username: 1 })
      .exec();

    const totalPromise = this.userModel.countDocuments(filter).exec();

    const [users, total] = await Promise.all([usersPromise, totalPromise]);

    return { users, total };
  }

  // Obtener contactos del usuario.

  async getUserContacts(username: string): Promise<string[]> {
    const user = await this.userModel
      .findOne({ username })
      .populate('contacts')
      .exec();

    if (!user) {
      throw new UserValidationException(
        UserValidationError.UserNotFound,
        HttpStatus.NOT_FOUND,
      );
    }

    return user.contacts;
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

  // Crear un usuario nuevo.

  async createUser(
    fullname: string,
    username: string,
    email: string,
    password: string,
    contacts: string[],
  ): Promise<User> {
    const newUser = new this.userModel({
      _id: new mongoose.Types.ObjectId(),
      fullname,
      username,
      email,
      password,
      contacts,
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

  // Encontrar un usuario por su correo electrónico.

  async findUserByEmail(email: string): Promise<User | undefined> {
    return this.userModel.findOne({ email }).exec();
  }

  // Agregar un usuario (contacto).

  async addContact(username: string, contacts: string): Promise<void> {
    const user = await this.userModel.findOne({ username });

    if (!user) {
      throw new UserValidationException(
        UserValidationError.UserNotFound,
        HttpStatus.NOT_FOUND,
      );
    }

    const contact = await this.userModel.findOne({ username: contacts });

    if (!contact) {
      throw new UserValidationException(
        UserValidationError.UserNotFound,
        HttpStatus.NOT_FOUND,
      );
    }

    if (user.contacts.includes(contacts)) {
      throw new UserValidationException(
        UserValidationError.ContactExit,
        HttpStatus.CONFLICT,
      );
    }

    user.contacts.push(contacts);

    await user.save();
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
        HttpStatus.CONFLICT,
      );
    }


    user.password = newPassword;

    await user.save();

  }

  // Actualizar foto de perfil.

  async updateProfilePicture(
    username: string,
    profilePicturePath: string,
    url?: string,
  ) {
    const user = await this.userModel.findOne({ username });

    if (!user) {
      throw new UserValidationException(
        UserValidationError.UserNotFound,
        HttpStatus.NOT_FOUND,
      );
    }

    if (url) {

      // Si se proporciona una URL, se actualiza la foto de perfil con la URL.

      user.profilePicture = url;

    } else {

      // Si no se proporciona una URL, se actualiza la foto de perfil con la ruta del archivo.

      user.profilePicture = profilePicturePath;

    }

    await user.save();
  }

  // Verificar si hay usuarios en la base de datos.

  async areThereAnyUsers(): Promise<boolean> {
    const count = await this.userModel.countDocuments().exec();

    return count > 0;
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

  // Eliminar un usuario (contacto).

  async deleteContact(username: string, contact: string): Promise<void> {
    const user = await this.userModel.findOne({ username });

    if (!user) {
      throw new UserValidationException(
        UserValidationError.UserNotFound,
        HttpStatus.NOT_FOUND,
      );
    }

    const contactIndex = user.contacts.indexOf(contact);

    if (contactIndex === -1) {
      throw new UserValidationException(
        UserValidationError.UserNotFound,
        HttpStatus.NOT_FOUND,
      );
    }

    user.contacts.splice(contactIndex, 1);

    await user.save();
  }
}
