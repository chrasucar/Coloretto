import { AuthService } from './auth.service';
import { LoginDto } from '../dto/login';
import { Request, Response } from 'express';
import { UsersService } from '../users.service';
import { JwtService } from '@nestjs/jwt';
export declare class AuthController {
    private readonly authService;
    private readonly userService;
    private readonly jwtService;
    constructor(authService: AuthService, userService: UsersService, jwtService: JwtService);
    getConnectionTime(username: string, res: Response): Promise<Response<any, Record<string, any>>>;
    login(loginDto: LoginDto, res: Response): Promise<any | null>;
    verifyToken(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    refreshToken(request: Request): Promise<{
        token: string;
    }>;
    logout(req: Request, res: Response): Promise<any>;
}
