import { ApiProperty } from '@nestjs/swagger';
import { TableResponseDto } from './table-response.dto';

export class TableListMetaDto {
  @ApiProperty({
    example: 25,
    description: 'Total number of tables for this restaurant (without filters)',
  })
  totalAll: number;

  @ApiProperty({
    example: 10,
    description: 'Number of tables after applying filters',
  })
  totalFiltered: number;
}

export class TableListResponseDto {
  @ApiProperty({ type: [TableResponseDto] })
  data: TableResponseDto[];

  @ApiProperty({ type: TableListMetaDto })
  meta: TableListMetaDto;
}
