import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ModifierType } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
  ValidationArguments,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  registerDecorator,
} from 'class-validator';

// ==================== CUSTOM VALIDATORS ====================

/**
 * Validator: Kiểm tra minChoices dựa trên required flag
 * - Nếu required = true: minChoices >= 1
 * - Nếu required = false: minChoices >= 0
 */
@ValidatorConstraint({ name: 'isValidMinChoices', async: false })
export class IsValidMinChoicesConstraint implements ValidatorConstraintInterface {
  validate(minChoices: number, args: ValidationArguments) {
    const dto = args.object as CreateModifierGroupDto | UpdateModifierGroupDto;

    if (minChoices === undefined || minChoices === null) {
      return true; // Optional field
    }

    // Nếu required = true, minChoices phải >= 1
    if (dto.required === true) {
      return minChoices >= 1;
    }

    // Nếu required = false, minChoices >= 0
    return minChoices >= 0;
  }

  defaultMessage(args: ValidationArguments) {
    const dto = args.object as CreateModifierGroupDto | UpdateModifierGroupDto;
    if (dto.required) {
      return 'minChoices must be >= 1 when required is true';
    }
    return 'minChoices must be >= 0 when required is false';
  }
}

/**
 * Validator: Kiểm tra maxChoices dựa trên type
 * - SINGLE_CHOICE: minChoices = maxChoices = 1
 * - MULTI_CHOICE: maxChoices >= minChoices (nếu có)
 */
@ValidatorConstraint({ name: 'isValidMaxChoices', async: false })
export class IsValidMaxChoicesConstraint implements ValidatorConstraintInterface {
  validate(maxChoices: number | undefined, args: ValidationArguments) {
    const dto = args.object as CreateModifierGroupDto | UpdateModifierGroupDto;

    // SINGLE_CHOICE: maxChoices phải = 1 (hoặc không có)
    if (dto.type === ModifierType.SINGLE_CHOICE) {
      return maxChoices === undefined || maxChoices === 1;
    }

    // MULTI_CHOICE: maxChoices >= minChoices
    if (dto.type === ModifierType.MULTI_CHOICE && maxChoices !== undefined) {
      const minChoices = dto.minChoices ?? 0;
      return maxChoices >= minChoices && maxChoices >= 1;
    }

    return true;
  }

  defaultMessage(args: ValidationArguments) {
    const dto = args.object as CreateModifierGroupDto | UpdateModifierGroupDto;

    if (dto.type === ModifierType.SINGLE_CHOICE) {
      return 'maxChoices must be 1 or undefined for SINGLE_CHOICE modifier';
    }
    return 'maxChoices must be >= minChoices and >= 1 for MULTI_CHOICE modifier';
  }
}

/**
 * Decorator: Apply minChoices validation
 */
function IsValidMinChoices() {
  return function (target: object, propertyKey: string | symbol | undefined) {
    registerDecorator({
      target: target.constructor,
      propertyName: propertyKey as string,
      constraints: [],
      validator: new IsValidMinChoicesConstraint(),
    });
  };
}

/**
 * Decorator: Apply maxChoices validation
 */
function IsValidMaxChoices() {
  return function (target: object, propertyKey: string | symbol | undefined) {
    registerDecorator({
      target: target.constructor,
      propertyName: propertyKey as string,
      constraints: [],
      validator: new IsValidMaxChoicesConstraint(),
    });
  };
}

// ==================== DTOs ====================

export class ModifierOptionDto {
  @ApiPropertyOptional({ example: 'opt_1' })
  @IsString()
  @IsOptional()
  id?: string;

  @ApiProperty({ example: 'Small' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name: string;

  @ApiProperty({ example: -10000 })
  @IsNumber()
  priceDelta: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(0)
  displayOrder: number;
}

export class CreateModifierGroupDto {
  @ApiProperty({ example: 'Size' })
  @IsString()
  @MinLength(1)
  @MaxLength(100)
  name: string;

  @ApiPropertyOptional({ example: 'Choose your preferred size' })
  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @ApiProperty({
    enum: ModifierType,
    example: 'SINGLE_CHOICE',
    description: 'SINGLE_CHOICE: radio button | MULTI_CHOICE: checkboxes',
  })
  @IsEnum(ModifierType)
  type: ModifierType;

  @ApiProperty({
    example: true,
    description: 'If true, customer must select at least 1 option',
  })
  @IsBoolean()
  required: boolean;

  @ApiPropertyOptional({
    example: 1,
    description: 'Minimum options customer must select. If required=true, must be >= 1',
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  @IsValidMinChoices()
  minChoices?: number;

  @ApiPropertyOptional({
    example: 3,
    description:
      'Maximum options customer can select. For SINGLE_CHOICE must be 1, for MULTI_CHOICE must be >= minChoices',
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  @IsValidMaxChoices()
  maxChoices?: number;

  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  displayOrder?: number;

  @ApiProperty({
    type: [ModifierOptionDto],
    example: [
      { name: 'Small', priceDelta: -10000, displayOrder: 1 },
      { name: 'Medium', priceDelta: 0, displayOrder: 2 },
      { name: 'Large', priceDelta: 15000, displayOrder: 3 },
    ],
    description: 'Must have at least 2 options',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ModifierOptionDto)
  options: ModifierOptionDto[];
}

export class UpdateModifierGroupDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MinLength(1)
  @MaxLength(100)
  name?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @MaxLength(500)
  description?: string;

  @ApiPropertyOptional({
    enum: ModifierType,
    description: 'SINGLE_CHOICE: radio button | MULTI_CHOICE: checkboxes',
  })
  @IsEnum(ModifierType)
  @IsOptional()
  type?: ModifierType;

  @ApiPropertyOptional({
    description: 'If true, customer must select at least 1 option',
  })
  @IsBoolean()
  @IsOptional()
  required?: boolean;

  @ApiPropertyOptional({
    description: 'Minimum options customer must select. If required=true, must be >= 1',
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Type(() => Number)
  @IsValidMinChoices()
  minChoices?: number;

  @ApiPropertyOptional({
    description:
      'Maximum options customer can select. For SINGLE_CHOICE must be 1, for MULTI_CHOICE must be >= minChoices',
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  @IsValidMaxChoices()
  maxChoices?: number;

  @ApiPropertyOptional()
  @IsInt()
  @IsOptional()
  @Min(0)
  @Type(() => Number)
  displayOrder?: number;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  @Type(() => Boolean)
  active?: boolean;

  @ApiPropertyOptional({ type: [ModifierOptionDto] })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ModifierOptionDto)
  options?: ModifierOptionDto[];
}
