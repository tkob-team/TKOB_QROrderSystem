import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { ModifierGroupRepository } from '../repositories/modifier-group.repository';
import { CreateModifierGroupDto, UpdateModifierGroupDto } from '../dto/modifier.dto';

@Injectable()
export class ModifierGroupService {
  constructor(private readonly modifierRepo: ModifierGroupRepository) {}

  async create(tenantId: string, dto: CreateModifierGroupDto) {
    return this.modifierRepo.createWithOptions({
      tenantId,
      name: dto.name,
      description: dto.description,
      type: dto.type,
      required: dto.required,
      minChoices: dto.minChoices,
      maxChoices: dto.maxChoices,
      options: dto.options,
    });
  }

  async findAll(tenantId: string, activeOnly = false) {
    if (activeOnly) {
      return this.modifierRepo.findAllActive(tenantId);
    }

    return this.modifierRepo.findAll({
      where: { tenantId },
      include: {
        options: {
          orderBy: { displayOrder: 'asc' },
        },
      },
      orderBy: { displayOrder: 'asc' },
    });
  }

  async findById(groupId: string) {
    const group = await this.modifierRepo.findByIdWithOptions(groupId);

    if (!group) {
      throw new NotFoundException('Modifier group not found');
    }

    return group;
  }

  async update(groupId: string, dto: UpdateModifierGroupDto) {
    await this.findById(groupId); // Verify exists

    return this.modifierRepo.updateWithOptions(groupId, dto);
  }

  async delete(groupId: string) {
    await this.findById(groupId); // Verify exists

    // Check if modifier is being used by menu items
    const itemsUsing = await this.modifierRepo['prisma'].menuItemModifier.count({
      where: { modifierGroupId: groupId },
    });

    if (itemsUsing > 0) {
      throw new ConflictException({
        message: `Cannot archive modifier group that is used by ${itemsUsing} menu item(s)`,
        itemsAffected: itemsUsing,
      });
    }

    // Soft delete by setting active = false
    return this.modifierRepo.update(groupId, { active: false });
  }
}
