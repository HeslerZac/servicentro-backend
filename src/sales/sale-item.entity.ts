import { Entity, PrimaryGeneratedColumn, ManyToOne, Column } from 'typeorm';
import { Sale } from './sale.entity';
import { Product } from '../products/product.entity';

@Entity('sale_items')
export class SaleItem {
  @PrimaryGeneratedColumn('uuid') id: string;

  @ManyToOne(() => Sale, (s) => s.items, { onDelete: 'CASCADE' })
  sale: Sale;

  @ManyToOne(() => Product, { eager: true }) product: Product;

  @Column({ type: 'numeric', precision: 12, scale: 3 }) quantity: string;
  @Column({ type: 'numeric', precision: 12, scale: 2 }) unitPrice: string;
  @Column({ type: 'numeric', precision: 12, scale: 2 }) subtotal: string;
}
