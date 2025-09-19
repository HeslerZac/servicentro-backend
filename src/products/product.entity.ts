import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid') id: string;

  @Column({ unique: true }) code: string;
  @Column() description: string;
  @Column({ nullable: true }) brand?: string;
  @Column({ nullable: true }) measure?: string;

  @Column('decimal', { precision: 10, scale: 2, default: 0 }) priceA: string;
  @Column('decimal', { precision: 10, scale: 2, default: 0 }) priceB: string;
  @Column('decimal', { precision: 10, scale: 2, default: 0 }) priceWholesale: string;

  @Column({ default: true }) isActive: boolean;

  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
