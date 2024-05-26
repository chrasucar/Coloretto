import { Controller, Post, Body, Req, HttpStatus, HttpException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from '../dto/login';
import { UserValidationException, UserValidationError } from '../users-exception';

@Controller('auth')
export class AuthController {

    constructor(private readonly authService: AuthService) {}

    // Iniciar sesión protegido.

    @Post('login')
    async login(@Body() loginDto: LoginDto): Promise<{ token: string } | null> {

      const { username, password } = loginDto;

      const token = await this.authService.login(username, password);

      if (!token) {

        throw new UserValidationException(UserValidationError.CredentialInvalid, HttpStatus.UNAUTHORIZED);

      }

      return { token };
      
    }

    // Renovación de token

    @Post('refresh-token')

    async refreshToken(@Req() request: Request): Promise<{ token: string }> {

        const tokens = request.headers['authorization'];

        if (!tokens) {

          throw new UserValidationException(UserValidationError.TokenInvalid, HttpStatus.UNAUTHORIZED);

        }

        const token = tokens.split(' ')[1];

        const newToken = await this.authService.refreshToken(token);

        return { token: newToken };
    }
  }
