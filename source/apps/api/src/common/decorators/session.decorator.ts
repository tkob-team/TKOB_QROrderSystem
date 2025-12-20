import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * @Session() decorator - Extract session data from request
 * Used by SessionGuard to attach table session info to request
 * 
 * Usage:
 * @Get('menu')
 * @UseGuards(SessionGuard)
 * async getMenu(@Session() session: any) { ... }
 */
export const Session = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.session;
  },
);
