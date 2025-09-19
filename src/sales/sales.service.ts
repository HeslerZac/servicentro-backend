import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Sale } from './sale.entity';
import { SaleItem } from './sale-item.entity';

@Injectable()
export class SalesService {
  constructor(
    @InjectRepository(Sale) private sales: Repository<Sale>,
    @InjectRepository(SaleItem) private items: Repository<SaleItem>,
  ) {}
}
