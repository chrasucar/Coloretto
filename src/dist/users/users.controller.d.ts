import { UsersService } from './users.service';
import { AuthService } from './auth/auth.service';
export declare class UsersController {
    private readonly usersService;
    private readonly authService;
    constructor(usersService: UsersService, authService: AuthService);
    getAllUsernames(): Promise<string[]>;
    getProfile(username: string): Promise<import("./user.schema").User>;
    register(fullname: string, username: string, email: string, password: string): Promise<{
        message: string;
        token: string;
    }>;
    changeEmail(username: string, password: string, newEmail: string): Promise<{
        message: string;
    }>;
    changePassword(username: string, currentPassword: string, newPassword: string, verifyPassword: string): Promise<{
        message: string;
    }>;
    updateProfilePicture(username: string, file: Express.Multer.File): Promise<{
        message: string;
        res: void;
    }>;
    deleteUser(username: string): Promise<{
        message: string;
    }>;
}
