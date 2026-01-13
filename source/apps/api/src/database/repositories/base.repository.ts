import { PrismaService } from '../prisma.service';
import type { PaginationDto } from '../../common/dto/pagination.dto';
import { PaginatedResponseDto } from '../../common/dto/pagination.dto';

/**
 * Base Repository
 * Provides common CRUD operations for Prisma models
 *
 * Usage:
 * export class UserRepository extends BaseRepository<User, Prisma.UserDelegate> {
 *   constructor(prisma: PrismaService) {
 *     super(prisma.user);
 *   }
 * }
 */
export abstract class BaseRepository<T, D> {
  constructor(protected readonly delegate: D) {}

  /**
   * Find by ID
   */
  async findById(id: string, include?: any): Promise<T | null> {
    return (this.delegate as any).findUnique({
      where: { id },
      ...(include && { include }),
    });
  }

  /**
   * Find one by condition
   */
  async findOne(where: any, include?: any): Promise<T | null> {
    return (this.delegate as any).findFirst({
      where,
      ...(include && { include }),
    });
  }

  /**
   * Find all
   */
  async findAll(options?: { where?: any; include?: any; orderBy?: any }): Promise<T[]> {
    return (this.delegate as any).findMany(options || {});
  }

  /**
   * Find with pagination
   */
  async findPaginated(
    pagination: PaginationDto,
    options?: {
      where?: any;
      include?: any;
      orderBy?: any;
    },
  ): Promise<PaginatedResponseDto<T>> {
    const { skip, take, page, limit } = pagination;

    const [data, total] = await Promise.all([
      (this.delegate as any).findMany({
        skip,
        take,
        ...options,
      }),
      (this.delegate as any).count({
        where: options?.where,
      }),
    ]);

    return new PaginatedResponseDto(data, total, page ?? 1, limit ?? 10);
  }

  /**
   * Create
   */
  async create(data: any): Promise<T> {
    return (this.delegate as any).create({ data });
  }

  /**
   * Update
   */
  async update(id: string, data: any): Promise<T> {
    return (this.delegate as any).update({
      where: { id },
      data,
    });
  }

  /**
   * Delete
   */
  async delete(id: string): Promise<T> {
    return (this.delegate as any).delete({
      where: { id },
    });
  }

  /**
   * Count
   */
  async count(where?: any): Promise<number> {
    return (this.delegate as any).count({ where });
  }

  /**
   * Exists
   */
  async exists(where: any): Promise<boolean> {
    const count = await (this.delegate as any).count({ where });
    return count > 0;
  }
}
