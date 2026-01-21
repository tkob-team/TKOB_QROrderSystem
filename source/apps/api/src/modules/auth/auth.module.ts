import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { EnvConfig } from '../../config/env.validation';

// Controllers
import { AuthController } from './controllers/auth.controller';
import { CustomerAuthController } from './controllers/customer-auth.controller';

// Services
import { AuthService } from './services/auth.service';
import { RegistrationService } from './services/registration.service';
import { SessionService } from './services/session.service';
import { TokenService } from './services/token.service';
import { OtpService } from './services/otp.service';
import { CustomerAuthService } from './services/customer-auth.service';
import { CustomerSessionService } from './services/customer-session.service';

// Guards & Strategies
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';
import { GoogleAuthGuard } from './guards/google-auth.guard';
import { CustomerAuthGuard } from './guards/customer-auth.guard';
import { OptionalCustomerAuthGuard } from './guards/optional-customer-auth.guard';
import { JwtStrategy } from './strategies/jwt.strategy';
import { GoogleStrategy } from './strategies/google.strategy';

// External modules (already global)
// - PrismaModule
// - RedisModule
// - EmailModule

import { TenantModule } from '../tenant/tenant.module';

@Module({
  imports: [
    // Tenant module for slug checking
    TenantModule,

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

    // Multer configuration for avatar uploads
    MulterModule.register({
      storage: memoryStorage(),
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB max
      },
    }),
  ],

  controllers: [AuthController, CustomerAuthController],

  providers: [
    // Main orchestrator
    AuthService,

    // Specialized services
    RegistrationService,
    SessionService,
    TokenService,
    OtpService,
    CustomerAuthService,
    CustomerSessionService,

    // Guards & Strategies
    JwtStrategy,
    GoogleStrategy,
    JwtAuthGuard,
    RolesGuard,
    GoogleAuthGuard,
    CustomerAuthGuard,
    OptionalCustomerAuthGuard,
  ],

  exports: [
    // Export for use in other modules
    AuthService,
    CustomerAuthService,
    JwtAuthGuard,
    RolesGuard,
    CustomerAuthGuard,
    OptionalCustomerAuthGuard,
    TokenService, // May be needed for other modules
  ],
})
export class AuthModule {}

