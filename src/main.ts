import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import * as passport from 'passport';
import * as cookieParser from 'cookie-parser';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { Server } from 'socket.io';

async function bootstrap() {

  dotenv.config();

  const app = await NestFactory.create(AppModule);

  // Activar CORS para frontend

  app.enableCors({
    origin: 'https://coloretto.vercel.app',
    methods: ['GET', 'POST', 'OPTIONS'],
    credentials: true,

  });

  // Activar cookies y pasaporte para JWT

  app.use(cookieParser());

  app.use(passport.initialize());

  // Adaptador de WebSocket

  app.useWebSocketAdapter(
    new (class extends IoAdapter {
      createIOServer(port: number, options?: any): Server {

        options = {
          cors: {
            origin: 'https://coloretto.vercel.app', 
            methods: ['GET', 'POST'],
            credentials: true,
          },
        };

        const server = super.createIOServer(port, options);

        server.on('connection', (socket) => {
          console.log('Nuevo cliente conectado:', socket.id);

          socket.on('disconnect', () => {
            console.log('Cliente desconectado:', socket.id);
          });

          socket.on('connect_error', (error) => {
            console.error('Error de conexión:', error);
          });
        });

        return server;
      }
    })(app),
  );

  const port = process.env.PORT || 3001;

  await app.listen(port);
  
}

bootstrap();

// Encabezados JWT para el token.

passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET || 'tfg2425',
    },
    (payload, done) => {
      const userId = payload.sub;
      done(null, { userId });
    },
  ),
);
