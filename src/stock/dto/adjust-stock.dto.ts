import { IsEnum, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { MovementType } from '../inventory-movement.entity';

export class AdjustStockDto {
  @IsEnum(MovementType)
  type: MovementType; // 'IN' | 'OUT'

  @IsUUID()
  productId: string;

  @IsUUID()
  warehouseId: string;

  @IsNumber()
  @Min(0.001)
  quantity: number;

  @IsOptional()
  @IsString()
  reason?: string;
}
