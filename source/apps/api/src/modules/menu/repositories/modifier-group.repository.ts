import { Injectable } from '@nestjs/common';
import { ModifierGroup, ModifierType, Prisma } from '@prisma/client';
import { PrismaService } from 'src/database/prisma.service';
import { BaseRepository } from 'src/database/repositories/base.repository';

@Injectable()
export class ModifierGroupRepository extends BaseRepository<
  ModifierGroup,
  Prisma.ModifierGroupDelegate
> {
  constructor(private readonly prisma: PrismaService) {
    super(prisma.modifierGroup);
  }

  async createWithOptions(data: {
    tenantId: string;
    name: string;
    description?: string;
    type: 'SINGLE_CHOICE' | 'MULTI_CHOICE';
    required: boolean;
    minChoices?: number;
    maxChoices?: number;
    displayOrder?: number;
    options: Array<{ name: string; priceDelta: number; displayOrder: number }>;
  }) {
    // Sử dụng prisma.x để áp dụng tenant filter
    return this.prisma.x.modifierGroup.create({
      data: {
        tenantId: data.tenantId,
        name: data.name,
        description: data.description,
        type: data.type,
        required: data.required,
        minChoices: data.minChoices || 0,
        maxChoices: data.maxChoices,
        displayOrder: data.displayOrder,
        options: {
          create: data.options,
        },
      },
      include: {
        options: true,
      },
    });
  }

  async findAllActive(tenantId: string, type?: ModifierType) {
    return this.prisma.x.modifierGroup.findMany({
      where: {
        tenantId,
        active: true,
        ...(type && { type }),
      },
      include: {
        options: {
          where: { active: true },
          orderBy: { displayOrder: 'asc' },
        },
      },
      orderBy: { displayOrder: 'asc' },
    });
  }

  async findByIdWithOptions(groupId: string) {
    return this.prisma.x.modifierGroup.findUnique({
      where: { id: groupId },
      include: {
        options: {
          orderBy: { displayOrder: 'asc' },
        },
      },
    });
  }

  async updateWithOptions(
    groupId: string,
    data: {
      name?: string;
      description?: string;
      type?: 'SINGLE_CHOICE' | 'MULTI_CHOICE';
      required?: boolean;
      minChoices?: number;
      maxChoices?: number;
      displayOrder?: number;
      active?: boolean;
      options?: Array<{
        id?: string;
        name: string;
        priceDelta: number;
        displayOrder: number;
      }>;
    },
  ) {
    // Sử dụng prisma gốc (không có extension) trong transaction
    // Vì ModifierOption không có tenant_id
    return this.prisma.$transaction(async (tx) => {
      // Update group - vẫn dùng tx vì nó kế thừa extension
      await tx.modifierGroup.update({
        where: { id: groupId },
        data: {
          name: data.name,
          description: data.description,
          type: data.type,
          required: data.required,
          minChoices: data.minChoices,
          maxChoices: data.maxChoices,
          displayOrder: data.displayOrder,
          active: data.active,
        },
      });

      // Update options if provided
      if (data.options) {
        // Get existing option IDs
        const existingOptions = await tx.modifierOption.findMany({
          where: { groupId },
          select: { id: true },
        });
        const existingIds = existingOptions.map((o) => o.id);

        // Option IDs from request
        const requestIds = data.options.filter((o) => o.id).map((o) => o.id!);

        // Delete removed options
        const idsToDelete = existingIds.filter((id) => !requestIds.includes(id));
        if (idsToDelete.length > 0) {
          await tx.modifierOption.deleteMany({
            where: {
              id: { in: idsToDelete },
              groupId,
            },
          });
        }

        // Upsert options
        for (const option of data.options) {
          if (option.id && existingIds.includes(option.id)) {
            // Update existing option
            await tx.modifierOption.update({
              where: { id: option.id },
              data: {
                name: option.name,
                priceDelta: option.priceDelta,
                displayOrder: option.displayOrder,
              },
            });
          } else {
            // Create new option
            await tx.modifierOption.create({
              data: {
                groupId,
                name: option.name,
                priceDelta: option.priceDelta,
                displayOrder: option.displayOrder,
              },
            });
          }
        }
      }

      // Return updated group with options
      return tx.modifierGroup.findUnique({
        where: { id: groupId },
        include: {
          options: {
            orderBy: { displayOrder: 'asc' },
          },
        },
      });
    });
  }
}
