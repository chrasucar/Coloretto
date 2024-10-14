"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const users_service_1 = require("./users.service");
const auth_service_1 = require("./auth/auth.service");
const upload_service_1 = require("./upload.service");
let UsersController = class UsersController {
    constructor(usersService, authService, uploadService) {
        this.usersService = usersService;
        this.authService = authService;
        this.uploadService = uploadService;
    }
    async getAllUsernames() {
        try {
            const usernames = await this.usersService.getAllUsernames();
            return usernames;
        }
        catch (error) {
            throw new Error('Error al obtener los nombres de usuario.');
        }
    }
    async getProfile(username) {
        const user = await this.usersService.findUserByUserName(username);
        if (!user) {
            return null;
        }
        return user;
    }
    async register(fullname, username, email, password) {
        const profilePicture = 'uploads/profile-pictures/defecto.png';
        const user = await this.usersService.createUser(fullname, username, email, password, profilePicture);
        const token = await this.authService.generateToken(user._id);
        return { message: 'Se ha registrado correctamente.', token };
    }
    async changeEmail(username, password, newEmail) {
        await this.usersService.changeEmail(username, password, newEmail);
        return { message: 'Correo electrónico actualizado correctamente.' };
    }
    async changePassword(username, currentPassword, newPassword, verifyPassword) {
        await this.usersService.changePassword(username, currentPassword, newPassword, verifyPassword);
        return { message: 'Contraseña actualizada correctamente.' };
    }
    async updateProfilePicture(username, file) {
        let filePath = '';
        if (file) {
            const fileUrl = await this.uploadService.uploadFile(file);
            filePath = fileUrl;
        }
        else {
            throw new Error('Debe proporcionar un archivo válido.');
        }
        const res = await this.usersService.updateProfilePicture(username, filePath);
        return { message: 'Foto de perfil actualizada correctamente.', res };
    }
    async deleteUser(username) {
        await this.usersService.deleteUser(username);
        return { message: 'Usuario eliminado correctamente.' };
    }
};
exports.UsersController = UsersController;
__decorate([
    (0, common_1.Get)('/usernames'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getAllUsernames", null);
__decorate([
    (0, common_1.Get)('profile/:username'),
    __param(0, (0, common_1.Param)('username')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getProfile", null);
__decorate([
    (0, common_1.Post)('register'),
    __param(0, (0, common_1.Body)('fullname')),
    __param(1, (0, common_1.Body)('username')),
    __param(2, (0, common_1.Body)('email')),
    __param(3, (0, common_1.Body)('password')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "register", null);
__decorate([
    (0, common_1.Put)('/profile/:username/change-email'),
    __param(0, (0, common_1.Param)('username')),
    __param(1, (0, common_1.Body)('password')),
    __param(2, (0, common_1.Body)('newEmail')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "changeEmail", null);
__decorate([
    (0, common_1.Put)('/profile/:username/change-password'),
    __param(0, (0, common_1.Param)('username')),
    __param(1, (0, common_1.Body)('currentPassword')),
    __param(2, (0, common_1.Body)('newPassword')),
    __param(3, (0, common_1.Body)('verifyPassword')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "changePassword", null);
__decorate([
    (0, common_1.Put)('/profile/:username/update-profile-picture'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.Param)('username')),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updateProfilePicture", null);
__decorate([
    (0, common_1.Delete)('/:username'),
    __param(0, (0, common_1.Param)('username')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "deleteUser", null);
exports.UsersController = UsersController = __decorate([
    (0, common_1.Controller)('users'),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        auth_service_1.AuthService,
        upload_service_1.UploadService])
], UsersController);
//# sourceMappingURL=users.controller.js.map