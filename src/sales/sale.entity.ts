import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Customer } from '../customers/customer.entity';
import { User } from '../users/user.entity';
import { SaleItem } from './sale-item.entity';

@Entity('sales')
export class Sale {
  @PrimaryGeneratedColumn('uuid') id: string;

  @ManyToOne(() => Customer, { nullable: true }) customer?: Customer;
  @ManyToOne(() => User, { nullable: false }) user: User;

  @Column({ type: 'numeric', precision: 12, scale: 2, default: 0 })
  total: string;

  @OneToMany(() => SaleItem, (i) => i.sale, { cascade: true })
  items: SaleItem[];

  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
