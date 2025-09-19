import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductDto {
  @IsString() code: string;
  @IsString() description: string;

  @IsOptional() @IsString() brand?: string;
  @IsOptional() @IsString() measure?: string;

  // Si mandas números como string desde el cliente, @Type los castea a number
  @IsOptional() @Type(() => Number) @IsNumber() priceA?: number;
  @IsOptional() @Type(() => Number) @IsNumber() priceB?: number;
  @IsOptional() @Type(() => Number) @IsNumber() priceWholesale?: number;

  @IsOptional() @IsBoolean() isActive?: boolean;
}
