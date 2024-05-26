import { HttpException, HttpStatus } from '@nestjs/common';

export enum UserValidationError {

  UsernameTaken = 'El nombre de usuario ya está en uso.',
  UserNotFound = 'Usuario no encontrado.',
  EmailTaken = 'El correo electrónico ya está en uso.',
  PasswordShort = 'La contraseña debe tener al menos 8 caracteres.',
  EmailNotFound = 'Correo electrónico no encontrado.',
  EmailSame = 'El nuevo correo electrónico introducido es igual al correo electrónico actual.',
  EmailEmpty = 'El nuevo correo electrónico no puede estar vacío.',
  PasswordNotFound = 'La contraseña actual introducida no es correcta.',
  PasswordSame = 'La nueva contraseña introducida no puede ser igual a la contraseña actual.',
  PasswordEmpty = 'La nueva contraseña no puede estar vacía.',
  ContactExit = 'El usuario ya está agregado.',
  UserEmpty = 'No existen usuarios registrados.',
  CredentialInvalid = 'Credenciales incorrectas. Por favor, inténtelo de nuevo.',
  TokenInvalid = 'Token incorrecto.'
  
}

export class UserValidationException extends HttpException {

  constructor(validationError: UserValidationError, statusCode: HttpStatus) {
    
    super(validationError, statusCode);

  }
}
