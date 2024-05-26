import { Injectable, HttpStatus, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { UserValidationError, UserValidationException } from '../users-exception';

@Injectable()

export class JwtAuthGuard extends AuthGuard('jwt') {

  handleRequest(err, user, info) {

    if (err || !user) {

      throw err || new UserValidationException(UserValidationError.TokenInvalid, HttpStatus.UNAUTHORIZED);


    }

    return user;
    
  }
}
