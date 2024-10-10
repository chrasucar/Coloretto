import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import * as passport from 'passport';
import { IoAdapter } from '@nestjs/platform-socket.io';

async function bootstrap() {

  dotenv.config();

  const app = await NestFactory.create(AppModule);

  // Activar CORS para frontend

  app.enableCors({

    origin: [
      'https://coloretto.vercel.app'
    ],
    credentials: true,

  });

  // Activar sockets y cookies del token.

  app.useWebSocketAdapter(new IoAdapter(app));
}

bootstrap();

// Encabezados JWT para el token.

passport.use(new JwtStrategy({

    secretOrKey: process.env.JWT_SECRET || 'tfg2425',
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),}, 
    (payload, done) => {
    const userId = payload.sub;
    done(null, { userId })
    
}));
