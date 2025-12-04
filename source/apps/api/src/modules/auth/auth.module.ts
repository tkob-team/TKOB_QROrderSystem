import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { EnvConfig } from '../../config/env.validation';

// Controllers
import { AuthController } from './controllers/auth.controller';

// Services
import { AuthService } from './services/auth.service';
import { RegistrationService } from './services/registration.service';
import { SessionService } from './services/session.service';
import { TokenService } from './services/token.service';
import { OtpService } from './services/otp.service';

// Guards & Strategies
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { JwtStrategy } from './strategies/jwt.strategy';

// External modules (already global)
// - PrismaModule
// - RedisModule
// - EmailModule

@Module({
  imports: [
    // Passport configuration
    PassportModule.register({ defaultStrategy: 'jwt' }),

    // JWT configuration
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (config: ConfigService<EnvConfig, true>) => ({
        secret: config.get('JWT_SECRET', { infer: true }),
        signOptions: {
          expiresIn: config.get('JWT_ACCESS_TOKEN_EXPIRES_IN', { infer: true }),
        },
      }),
      inject: [ConfigService],
    }),
  ],

  controllers: [AuthController],

  providers: [
    // Main orchestrator
    AuthService,

    // Specialized services
    RegistrationService,
    SessionService,
    TokenService,
    OtpService,

    // Guards & Strategies
    JwtStrategy,
    JwtAuthGuard,
    RolesGuard,
  ],

  exports: [
    // Export for use in other modules
    AuthService,
    JwtAuthGuard,
    RolesGuard,
    TokenService, // May be needed for other modules
  ],
})
export class AuthModule {}
