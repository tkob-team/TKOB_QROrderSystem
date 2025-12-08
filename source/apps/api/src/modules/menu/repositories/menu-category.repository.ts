import { Injectable } from '@nestjs/common';
import { MenuCategory, Prisma } from '@prisma/client';
import { PrismaService } from 'src/database/prisma.service';
import { BaseRepository } from 'src/database/repositories/base.repository';

@Injectable()
export class MenuCategoryRepository extends BaseRepository<
  MenuCategory,
  Prisma.MenuCategoryDelegate
> {
  constructor(prisma: PrismaService) {
    super(prisma.menuCategory);
  }
}
