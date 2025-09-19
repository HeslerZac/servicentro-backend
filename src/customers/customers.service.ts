import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from './customer.entity';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Injectable()
export class CustomersService {
  constructor(@InjectRepository(Customer) private repo: Repository<Customer>) {}

  async create(dto: CreateCustomerDto) {
    if (dto.email) {
      const exists = await this.repo.findOne({ where: { email: dto.email } });
      if (exists) throw new BadRequestException('El email ya está registrado');
    }
    const entity = this.repo.create({ nit: 'CF', isActive: true, ...dto });
    return this.repo.save(entity);
  }

  findAll() {
    return this.repo.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: string) {
    const c = await this.repo.findOne({ where: { id } });
    if (!c) throw new NotFoundException('Cliente no encontrado');
    return c;
  }

  async update(id: string, dto: UpdateCustomerDto) {
    const c = await this.findOne(id);
    if (dto.email && dto.email !== c.email) {
      const exists = await this.repo.findOne({ where: { email: dto.email } });
      if (exists) throw new BadRequestException('El email ya está registrado');
    }
    Object.assign(c, dto);
    return this.repo.save(c);
  }

  async remove(id: string) {
    const c = await this.findOne(id);
    await this.repo.remove(c);
    return { deleted: true };
  }
}
