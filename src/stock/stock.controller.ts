import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { StockService } from './stock.service';
import { CreateStockDto } from './dto/create-stock.dto';
import { UpdateStockDto } from './dto/update-stock.dto';
import { AdjustStockDto } from './dto/adjust-stock.dto';

@Controller('stock')
export class StockController {
  constructor(private readonly service: StockService) {}

  // CRUD simple del registro de stock (par producto+bodega)
  @Post() create(@Body() dto: CreateStockDto) { return this.service.create(dto); }
  @Get() findAll() { return this.service.findAll(); }
  @Get(':id') findOne(@Param('id') id: string) { return this.service.findOne(id); }
  @Patch(':id') update(@Param('id') id: string, @Body() dto: UpdateStockDto) { return this.service.update(id, dto); }
  @Delete(':id') remove(@Param('id') id: string) { return this.service.remove(id); }

  // Ajustes de inventario (movimientos de entrada/salida)
  @Post('movements') adjust(@Body() dto: AdjustStockDto) { return this.service.adjust(dto); }

  // Listado de movimientos (filtrable)
  @Get('movements/list')
  listMovements(@Query('productId') productId?: string, @Query('warehouseId') warehouseId?: string) {
    return this.service.listMovements(productId, warehouseId);
  }
}
