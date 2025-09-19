import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

export enum UserRole { ADMIN = 'ADMIN', SECRETARY = 'SECRETARY', SELLER = 'SELLER' }

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid') id: string;

  @Index({ unique: true })
  @Column() username: string;

  @Column() passwordHash: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.SECRETARY })
  role: UserRole;

  @Column({ default: true }) isActive: boolean;

  @CreateDateColumn() createdAt: Date;
  @UpdateDateColumn() updatedAt: Date;
}
