import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import * as passport from 'passport';

async function bootstrap() {

  dotenv.config();

  const app = await NestFactory.create(AppModule);

  await app.listen(3000);

}

bootstrap();

passport.use(new JwtStrategy({

    secretOrKey: 'tfg2425',
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),}, 
    (payload, done) => {
    const userId = payload.sub;
    done(null, { userId })
    
}));
