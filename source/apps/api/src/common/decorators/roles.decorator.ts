import { SetMetadata } from '@nestjs/common';
import type { UserRole } from '@prisma/client';

export const Roles = (...roles: UserRole[]) => SetMetadata('roles', roles);
