import { HttpException, HttpStatus } from '@nestjs/common';
export declare enum UserValidationError {
    UsernameTaken = "El nombre de usuario ya est\u00E1 en uso.",
    UserNotFound = "Usuario no encontrado.",
    UserEmpty = "No existen usuarios registrados.",
    EmailNotFound = "Correo electr\u00F3nico no encontrado.",
    EmailSame = "El nuevo correo electr\u00F3nico introducido es igual al correo electr\u00F3nico actual.",
    EmailEmpty = "El nuevo correo electr\u00F3nico no puede estar vac\u00EDo.",
    EmailTaken = "El correo electr\u00F3nico ya est\u00E1 en uso.",
    PasswordIncorrect = "La contrase\u00F1a es incorrecta.",
    PasswordShort = "La contrase\u00F1a debe tener al menos 8 caracteres.",
    PasswordNotFound = "La contrase\u00F1a actual introducida no es correcta.",
    PasswordSame = "La nueva contrase\u00F1a introducida no puede ser igual a la contrase\u00F1a actual.",
    PasswordEmpty = "La nueva contrase\u00F1a no puede estar vac\u00EDa.",
    PasswordNotEqual = "La nueva contrase\u00F1a introducida no es igual a la verificaci\u00F3n de la nueva contrase\u00F1a.",
    CredentialInvalid = "Credenciales incorrectas. Por favor, int\u00E9ntelo de nuevo.",
    FieldsRequired = "Introduce el dato.",
    TokenInvalid = "Token incorrecto."
}
export declare class UserValidationException extends HttpException {
    constructor(validationError: UserValidationError, statusCode: HttpStatus);
}
