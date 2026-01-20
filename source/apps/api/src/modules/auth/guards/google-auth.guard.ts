import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {
  getAuthenticateOptions(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    // Pass state parameter from query string to Google OAuth
    // This allows us to distinguish customer vs tenant OAuth
    const state = request.query?.state || 'tenant';
    return {
      state,
    };
  }
}
