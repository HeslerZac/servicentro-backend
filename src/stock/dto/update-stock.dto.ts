import { IsNumber, IsOptional, Min, IsUUID } from 'class-validator';

export class UpdateStockDto {
  @IsOptional()
  @IsUUID()
  productId?: string;

  @IsOptional()
  @IsUUID()
  warehouseId?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  quantity?: number;
}
