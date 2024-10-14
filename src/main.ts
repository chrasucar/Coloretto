import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import * as passport from 'passport';
import * as cookieParser from 'cookie-parser';
import { IoAdapter } from '@nestjs/platform-socket.io';

async function bootstrap() {

  dotenv.config();

  const app = await NestFactory.create(AppModule);

  // Activar CORS para frontend

  app.enableCors({

    origin: [
      'https://coloretto.vercel.app',
      'http://localhost:4000'
    ],
    credentials: true,

  });

  app.use(passport.initialize());

  // Activar sockets y cookies del token.

  app.use(cookieParser());

  app.useWebSocketAdapter(new IoAdapter(app));

  const port = 3001;

  await app.listen(port);

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