"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserValidationException = exports.UserValidationError = void 0;
const common_1 = require("@nestjs/common");
var UserValidationError;
(function (UserValidationError) {
    UserValidationError["UsernameTaken"] = "El nombre de usuario ya est\u00E1 en uso.";
    UserValidationError["UserNotFound"] = "Usuario no encontrado.";
    UserValidationError["UserEmpty"] = "No existen usuarios registrados.";
    UserValidationError["EmailNotFound"] = "Correo electr\u00F3nico no encontrado.";
    UserValidationError["EmailSame"] = "El nuevo correo electr\u00F3nico introducido es igual al correo electr\u00F3nico actual.";
    UserValidationError["EmailEmpty"] = "El nuevo correo electr\u00F3nico no puede estar vac\u00EDo.";
    UserValidationError["EmailTaken"] = "El correo electr\u00F3nico ya est\u00E1 en uso.";
    UserValidationError["PasswordIncorrect"] = "La contrase\u00F1a es incorrecta.";
    UserValidationError["PasswordShort"] = "La contrase\u00F1a debe tener al menos 8 caracteres.";
    UserValidationError["PasswordNotFound"] = "La contrase\u00F1a actual introducida no es correcta.";
    UserValidationError["PasswordSame"] = "La nueva contrase\u00F1a introducida no puede ser igual a la contrase\u00F1a actual.";
    UserValidationError["PasswordEmpty"] = "La nueva contrase\u00F1a no puede estar vac\u00EDa.";
    UserValidationError["PasswordNotEqual"] = "La nueva contrase\u00F1a introducida no es igual a la verificaci\u00F3n de la nueva contrase\u00F1a.";
    UserValidationError["CredentialInvalid"] = "Credenciales incorrectas. Por favor, int\u00E9ntelo de nuevo.";
    UserValidationError["FieldsRequired"] = "Introduce el dato.";
    UserValidationError["TokenInvalid"] = "Token incorrecto.";
})(UserValidationError || (exports.UserValidationError = UserValidationError = {}));
class UserValidationException extends common_1.HttpException {
    constructor(validationError, statusCode) {
        super(validationError, statusCode);
    }
}
exports.UserValidationException = UserValidationException;
//# sourceMappingURL=users-exception.js.map