import { Injectable, HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users.service';
import {
  UserValidationException,
  UserValidationError,
} from '../users-exception';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async getConnectionTime(username: string): Promise<string> {
    try {
      const user = await this.usersService.findUserByUserName(username);

      if (!user) {
        throw new UserValidationException(
          UserValidationError.UserNotFound,
          HttpStatus.UNAUTHORIZED,
        );
      }

      if (user.isOnline) {
        return `Conectado.`;
      } else {
        const lastSeen = user.lastSeen;

        if (lastSeen) {
          const elapsedTime = await this.calculateElapsedTime(
            new Date(lastSeen),
          );
          const timeString = await this.calculateElapsedTimeString(elapsedTime);

          return `Conectado hace ${timeString}.`;
        } else {
          return 'Nunca Conectado.';
        }
      }
    } catch (error) {
      throw new Error('Error al obtener el tiempo de conexión.');
    }
  }

  // Calcular tiempo de desconexión.

  async calculateElapsedTime(lastSeen: Date): Promise<number> {
    const currentTime = new Date().getTime();
    const elapsedTime = currentTime - lastSeen.getTime();
    return elapsedTime;
  }

  async calculateElapsedTimeString(elapsedTime: number): Promise<string> {
    const seconds = Math.floor(elapsedTime / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    let timeString = '';
    if (days > 0) {
      timeString += `${days}d`;
    } else if (hours > 0) {
      timeString += `${hours}h`;
    } else if (minutes > 0) {
      timeString += `${minutes}m`;
    } else {
      timeString += `${seconds}s`;
    }

    return timeString;
  }

  // Iniciar sesión protegido.

  async login(username: string, password: string): Promise<string | null> {
    try {
      const user = await this.usersService.findUserByUserName(username);

      if (!user) {
        throw new UserValidationException(
          UserValidationError.UserNotFound,
          HttpStatus.UNAUTHORIZED,
        );
      }

      if (password !== user.password) {
        throw new UserValidationException(
          UserValidationError.PasswordNotFound,
          HttpStatus.UNAUTHORIZED,
        );
      }

      await this.usersService.updateConnectionStartTime(user._id, new Date());

      const payload = { username: user.username, sub: user._id };
      const token = this.jwtService.sign(payload);

      return token;
    } catch (error) {
      if (error instanceof UserValidationException) {
        throw error;
      } else {
        throw new Error('Error interno del servidor.');
      }
    }
  }

  // Generar token para registro.

  async generateToken(userId: string): Promise<string> {
    const payload = { sub: userId };

    return this.jwtService.sign(payload);
  }

  // Verificar token.

  async verifyToken(token: string) {
    try {
      const decoded = this.jwtService.verify(token);

      const user = await this.usersService.findById(decoded.sub);

      if (!user) {
        throw new UserValidationException(
          UserValidationError.UserNotFound,
          HttpStatus.UNAUTHORIZED,
        );
      }

      return { _id: user._id, username: user.username, email: user.email };
    } catch (error) {
      throw new UserValidationException(
        UserValidationError.TokenInvalid,
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  // Renovar token

  async refreshToken(token: string): Promise<string> {
    try {
      const decoded = this.jwtService.verify(token);

      const user = await this.usersService.findById(decoded.sub);

      if (!user) {
        throw new UserValidationException(
          UserValidationError.UserNotFound,
          HttpStatus.UNAUTHORIZED,
        );
      }

      const newToken = await this.generateToken(user._id);

      return newToken;
    } catch (error) {
      throw new UserValidationException(
        UserValidationError.TokenInvalid,
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  async logout(username: string): Promise<void> {
    try {
      const user = await this.usersService.findUserByUserName(username);

      if (!user) {
        throw new UserValidationException(
          UserValidationError.UserNotFound,
          HttpStatus.UNAUTHORIZED,
        );
      }

      user.lastSeen = new Date();
      user.isOnline = false;

      await this.usersService.updateLastSeen(
        username,
        user.lastSeen,
        user.isOnline,
      );
    } catch (error) {
      throw new Error('Error al cerrar sesión.');
    }
  }
}
