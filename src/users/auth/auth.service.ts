import { Injectable, HttpStatus } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users.service';
import { UserValidationException, UserValidationError } from '../users-exception';

@Injectable()
export class AuthService {

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async login(username: string, password: string): Promise<string | null> {

    const user = await this.usersService.findUserByUserName(username);

    if (!user) {

      throw new UserValidationException(UserValidationError.UserNotFound, HttpStatus.UNAUTHORIZED);

    }

    if (password !== user.password) {

      throw new UserValidationException(UserValidationError.PasswordNotFound, HttpStatus.UNAUTHORIZED);

    }

    const payload = { username: user.username, sub: user._id };

    return this.jwtService.sign(payload);

  }

  // Generar token para registro.

  async generateToken(userId: string): Promise<string> {

    const payload = { sub: userId };

    return this.jwtService.sign(payload);

  }

  // Verificar token.

  async decodeToken(token: string) {

    try {

      const decoded = this.jwtService.verify(token);

      return decoded;

    } 
    
    catch (error) {

      throw new UserValidationException(UserValidationError.TokenInvalid, HttpStatus.UNAUTHORIZED);

    }
  }

  // Renovar token

  async refreshToken(token: string): Promise<string> {

    try {

        const decoded = this.jwtService.verify(token);

        const user = await this.usersService.findById(decoded.sub);

        if (!user) {

          throw new UserValidationException(UserValidationError.UserNotFound, HttpStatus.UNAUTHORIZED);

        }

        const newToken = await this.generateToken(user._id);

        return newToken;

    } 
    
    catch (error) {

      throw new UserValidationException(UserValidationError.TokenInvalid, HttpStatus.UNAUTHORIZED);

    }
}
}
