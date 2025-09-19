import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn,
  Unique, CreateDateColumn, UpdateDateColumn, Index
} from 'typeorm';
import { Product } from '../products/product.entity';
import { Warehouse } from '../warehouses/warehouse.entity';

const decimalTransformer = {
  to: (value?: number | null) => value,
  from: (value: string | null) => (value === null ? null : parseFloat(value)),
};

@Entity('stock')
@Unique(['product', 'warehouse'])
export class Stock {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @ManyToOne(() => Product, { eager: true })
  @JoinColumn({ name: 'productId' })
  product: Product;

  @Index()
  @ManyToOne(() => Warehouse, { eager: true })
  @JoinColumn({ name: 'warehouseId' })
  warehouse: Warehouse;

  @Column('numeric', { precision: 12, scale: 3, default: 0, transformer: decimalTransformer })
  quantity: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
