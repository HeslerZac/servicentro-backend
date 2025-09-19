import { IsUUID, IsNumber, Min } from 'class-validator';

export class CreateStockDto {
  @IsUUID()
  productId: string;

  @IsUUID()
  warehouseId: string;

  @IsNumber()
  @Min(0)
  quantity: number;
}
