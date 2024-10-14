import {
  Controller,
  Param,
  Get,
  Post,
  Body,
  Req,
  Res,
  HttpStatus,
} from '@nestjs/common';

import { AuthService } from './auth.service';
import { LoginDto } from '../dto/login';
import { UserValidationException, UserValidationError,} from '../users-exception';
import { Request, Response } from 'express';
import { UsersService } from '../users.service';
import { JwtService } from '@nestjs/jwt';

@Controller('auth')

export class AuthController {

  constructor(
    private readonly authService: AuthService,
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  // Obtener tiempo de conexión del usuario.

  @Get('/:username/connection-time')
  async getConnectionTime(@Param('username') username: string, @Res() res: Response) {

    try {

      if (!username) {

        return res.status(HttpStatus.BAD_REQUEST).json({ message: 'No se proporcionó un nombre de usuario válido.' });
        
      }

      if (username) {

        const connectionTime = await this.authService.getConnectionTime(username);

        return res.status(HttpStatus.OK).json({ connectionTime });

      } 
      
      else {
        throw new Error('No se proporcionó un nombre de usuario válido en la solicitud.');
      }

    } catch (error) {

      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Error al obtener el tiempo de conexión.' });
      
    }
  }

  // Iniciar sesión protegido.

  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Res() res: Response,
  ): Promise<any | null> {

    const { username, password } = loginDto;

    const token = await this.authService.login(username, password);

    if (!token) {
      throw new UserValidationException(
        UserValidationError.CredentialInvalid,
        HttpStatus.UNAUTHORIZED,
      );
    }

    await this.userService.updateLastSeen(username, new Date(), true);

    res.cookie('token', token, { httpOnly: true, secure: false });

    return res
      .status(HttpStatus.OK)
      .json({ username: username, password: password });
  }

  // Verificación de token

  @Post('verify-token')
  async verifyToken(@Req() req: Request, @Res() res: Response) {
    const { token } = req.cookies;
  
    if (!token) {
      return res.status(HttpStatus.UNAUTHORIZED).json({ message: 'Token no proporcionado' });
    }
  
    try {
      const userData = await this.authService.verifyToken(token);
      return res.status(HttpStatus.OK).json(userData);
    } catch (error) {
      return res.status(HttpStatus.UNAUTHORIZED).json({ message: 'Token inválido' });
    }
  }

  // Renovación de token

  @Post('refresh-token')
  async refreshToken(@Req() request: Request): Promise<{ token: string }> {
    try {
      const tokens = request.cookies;

      if (!tokens || !tokens.token) {
        throw new UserValidationException(
          UserValidationError.TokenInvalid,
          HttpStatus.UNAUTHORIZED,
        );
      }

      const newToken = await this.authService.refreshToken(tokens.token);

      return { token: newToken };
    } catch (error) {
      throw new UserValidationException(
        UserValidationError.TokenInvalid,
        HttpStatus.UNAUTHORIZED,
      );
    }
  }

  // Eliminar token

  @Post('logout')
  async logout(@Req() req: Request, @Res() res: Response): Promise<any> {
    try {

      res.clearCookie('token');

      const { token } = req.cookies;

      if (token) {
        const decodedToken: any = this.jwtService.decode(token);
        if (decodedToken) {
          const username = decodedToken.username;
          await this.userService.updateLastSeen(username, new Date(), false);
        }
      }

      return res
        .status(HttpStatus.OK)
        .json({ message: 'Ha cerrado sesión. ¡Esperemos que vuelva pronto!' });
    } catch (error) {
      return res
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: 'Error al cerrar sesión.' });
    }
  }
}
