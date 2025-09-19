import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Warehouse } from './warehouse.entity';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';

@Injectable()
export class WarehousesService {
  constructor(@InjectRepository(Warehouse) private readonly repo: Repository<Warehouse>) {}

  async create(dto: CreateWarehouseDto) {
    const exists = await this.repo.findOne({ where: { code: dto.code } });
    if (exists) throw new BadRequestException('El código de bodega ya existe');
    const entity = this.repo.create({ isActive: dto.isActive ?? true, ...dto });
    return this.repo.save(entity);
  }

  findAll() {
    return this.repo.find({ order: { name: 'ASC' } });
  }

  async findOne(id: string) {
    const found = await this.repo.findOne({ where: { id } });
    if (!found) throw new NotFoundException('Bodega no encontrada');
    return found;
  }

  async update(id: string, dto: UpdateWarehouseDto) {
    const w = await this.findOne(id);
    if (dto.code && dto.code !== w.code) {
      const exists = await this.repo.findOne({ where: { code: dto.code } });
      if (exists) throw new BadRequestException('El código de bodega ya existe');
    }
    Object.assign(w, dto);
    return this.repo.save(w);
  }

  async remove(id: string) {
    const w = await this.findOne(id);
    await this.repo.remove(w);
    return { deleted: true };
  }
}
