"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const dotenv = require("dotenv");
const passport_jwt_1 = require("passport-jwt");
const passport = require("passport");
const cookieParser = require("cookie-parser");
const platform_socket_io_1 = require("@nestjs/platform-socket.io");
async function bootstrap() {
    dotenv.config();
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors({
        origin: 'https://coloretto.vercel.app',
        credentials: true,
    });
    app.use(passport.initialize());
    app.use(cookieParser());
    app.useWebSocketAdapter(new platform_socket_io_1.IoAdapter(app));
}
bootstrap();
passport.use(new passport_jwt_1.Strategy({
    secretOrKey: process.env.JWT_SECRET || 'tfg2425',
    jwtFromRequest: passport_jwt_1.ExtractJwt.fromAuthHeaderAsBearerToken(),
}, (payload, done) => {
    const userId = payload.sub;
    done(null, { userId });
}));
//# sourceMappingURL=main.js.map