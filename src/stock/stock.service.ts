import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Stock } from './stock.entity';
import { InventoryMovement, MovementType } from './inventory-movement.entity';
import { CreateStockDto } from './dto/create-stock.dto';
import { UpdateStockDto } from './dto/update-stock.dto';
import { AdjustStockDto } from './dto/adjust-stock.dto';
import { Product } from '../products/product.entity';
import { Warehouse } from '../warehouses/warehouse.entity';

@Injectable()
export class StockService {
  constructor(
    @InjectRepository(Stock) private readonly stockRepo: Repository<Stock>,
    @InjectRepository(InventoryMovement) private readonly movementRepo: Repository<InventoryMovement>,
    @InjectRepository(Product) private readonly productRepo: Repository<Product>,
    @InjectRepository(Warehouse) private readonly warehouseRepo: Repository<Warehouse>,
  ) {}

  async create(dto: CreateStockDto) {
    const product = await this.productRepo.findOne({ where: { id: dto.productId } });
    if (!product) throw new BadRequestException('Producto no existe');

    const warehouse = await this.warehouseRepo.findOne({ where: { id: dto.warehouseId } });
    if (!warehouse) throw new BadRequestException('Bodega no existe');

    const exists = await this.stockRepo.findOne({ where: { product: { id: dto.productId }, warehouse: { id: dto.warehouseId } } });
    if (exists) throw new BadRequestException('Ya existe stock para este producto en esta bodega');

    const entity = this.stockRepo.create({
      product,
      warehouse,
      quantity: dto.quantity ?? 0,
    });
    return this.stockRepo.save(entity);
  }

  findAll() {
    return this.stockRepo.find({ order: { updatedAt: 'DESC' } });
  }

  async findOne(id: string) {
    const s = await this.stockRepo.findOne({ where: { id } });
    if (!s) throw new NotFoundException('Stock no encontrado');
    return s;
  }

  async update(id: string, dto: UpdateStockDto) {
    const s = await this.findOne(id);
    if (dto.productId || dto.warehouseId) {
      throw new BadRequestException('No se permite cambiar productId/warehouseId en update');
    }
    if (typeof dto.quantity === 'number') {
      s.quantity = dto.quantity;
    }
    return this.stockRepo.save(s);
  }

  async remove(id: string) {
    const s = await this.findOne(id);
    await this.stockRepo.remove(s);
    return { deleted: true };
  }

  async adjust(dto: AdjustStockDto) {
    const product = await this.productRepo.findOne({ where: { id: dto.productId } });
    if (!product) throw new BadRequestException('Producto no existe');

    const warehouse = await this.warehouseRepo.findOne({ where: { id: dto.warehouseId } });
    if (!warehouse) throw new BadRequestException('Bodega no existe');

    let s = await this.stockRepo.findOne({ where: { product: { id: dto.productId }, warehouse: { id: dto.warehouseId } } });
    if (!s) {
      // si no existe, lo creamos con 0
      s = this.stockRepo.create({ product, warehouse, quantity: 0 });
    }

    const qty = dto.quantity;
    if (dto.type === MovementType.OUT && s.quantity < qty) {
      throw new BadRequestException('Stock insuficiente para salida');
    }

    s.quantity = dto.type === MovementType.IN ? s.quantity + qty : s.quantity - qty;
    await this.stockRepo.save(s);

    const mv = this.movementRepo.create({
      product,
      warehouse,
      type: dto.type,
      quantity: qty, // guardamos positiva; el signo lo infiere type
      reason: dto.reason,
    });
    await this.movementRepo.save(mv);

    return { stock: s, movement: mv };
  }

  listMovements(productId?: string, warehouseId?: string) {
    const where: any = {};
    if (productId) where.product = { id: productId };
    if (warehouseId) where.warehouse = { id: warehouseId };
    return this.movementRepo.find({
      where,
      order: { createdAt: 'DESC' },
    });
  }
}
