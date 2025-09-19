import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Injectable()
export class ProductsService {
  constructor(@InjectRepository(Product) private repo: Repository<Product>) {}

  async create(dto: CreateProductDto) {
    const exists = await this.repo.findOne({ where: { code: dto.code } });
    if (exists) throw new BadRequestException('El código ya existe');
    const entity = this.repo.create({
      ...dto,
      priceA: String(dto.priceA ?? 0),
      priceB: String(dto.priceB ?? 0),
      priceWholesale: String(dto.priceWholesale ?? 0),
    });
    return this.repo.save(entity);
  }

  findAll() {
    return this.repo.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: string) {
    const found = await this.repo.findOne({ where: { id } });
    if (!found) throw new NotFoundException('Producto no encontrado');
    return found;
  }

  async update(id: string, dto: UpdateProductDto) {
    const prod = await this.findOne(id);
    Object.assign(prod, {
      ...dto,
      ...(dto.priceA !== undefined ? { priceA: String(dto.priceA) } : {}),
      ...(dto.priceB !== undefined ? { priceB: String(dto.priceB) } : {}),
      ...(dto.priceWholesale !== undefined ? { priceWholesale: String(dto.priceWholesale) } : {}),
    });
    return this.repo.save(prod);
  }

  async remove(id: string) {
    const prod = await this.findOne(id);
    await this.repo.remove(prod);
    return { deleted: true };
  }
}
