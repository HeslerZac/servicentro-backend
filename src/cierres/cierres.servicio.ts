import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, DataSource, Repository } from 'typeorm';
import { CierreVenta } from './cierre-venta.entidad';
import { GenerarCierreDto } from './dto/generar-cierre.dto';
import { Venta } from '../ventas/venta.entidad';
import { DetalleVenta } from '../ventas/detalle-venta.entidad';

@Injectable()
export class CierresServicio {
  constructor(
    @InjectRepository(CierreVenta)
    private readonly cierresRepo: Repository<CierreVenta>,
    @InjectRepository(Venta) private readonly ventasRepo: Repository<Venta>,
    @InjectRepository(DetalleVenta)
    private readonly detallesRepo: Repository<DetalleVenta>,
    private readonly dataSource: DataSource,
  ) {}

  listar(filtros?: {
    fechaInicio?: string;
    fechaFin?: string;
    search?: string;
  }) {
    const qb = this.cierresRepo.createQueryBuilder('cierre');

    if (filtros?.fechaInicio) {
      const inicio = this.parsearFecha(filtros.fechaInicio);
      if (inicio) {
        qb.andWhere('cierre.fechaInicio >= :inicio', { inicio });
      }
    }

    if (filtros?.fechaFin) {
      const fin = this.parsearFecha(filtros.fechaFin);
      if (fin) {
        qb.andWhere('cierre.fechaFin <= :fin', { fin });
      }
    }

    if (filtros?.search) {
      const search = `%${filtros.search.toLowerCase()}%`;
      qb.andWhere('LOWER(cierre.periodo) LIKE :search', { search });
    }

    qb.orderBy('cierre.fechaInicio', 'DESC');

    return qb.getMany();
  }

  private parsearFecha(fecha: string): Date | null {
    if (!fecha) return null;

    // Formato DD/MM/YYYY
    const partesDMY = fecha.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (partesDMY) {
      const [, dia, mes, anio] = partesDMY.map(Number);
      return new Date(Date.UTC(anio, mes - 1, dia));
    }

    // Formato YYYY-MM-DD
    const partesYMD = fecha.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
    if (partesYMD) {
      const [, anio, mes, dia] = partesYMD.map(Number);
      return new Date(Date.UTC(anio, mes - 1, dia));
    }

    // Fallback para otros formatos que new Date() pueda entender
    const d = new Date(fecha);
    if (!isNaN(d.getTime()) && d.getFullYear() > 1000) {
      return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
    }

    return null;
  }

  async generar(dto: GenerarCierreDto) {
    const fechaInicio = new Date(dto.fechaInicio);
    const fechaFin = new Date(dto.fechaFin);
    if (fechaFin < fechaInicio) {
      throw new BadRequestException('El rango de fechas es invalido');
    }

    const clavePeriodo = `${dto.periodo}-${dto.fechaInicio}-${dto.fechaFin}`;

    return this.dataSource.transaction(async (manager) => {
      const repetido = await manager
        .getRepository(CierreVenta)
        .findOne({ where: { periodo: clavePeriodo } });
      if (repetido) {
        throw new BadRequestException(
          'Ya existe un cierre para el periodo indicado',
        );
      }

      const ventas = await manager.getRepository(Venta).find({
        where: { creadaEn: Between(fechaInicio, fechaFin) },
        relations: ['detalles'],
      });

      const totalVenta = ventas.reduce(
        (acc, venta) => acc + Number(venta.total),
        0,
      );
      const totalCosto = ventas.reduce((acc, venta) => {
        const costoVenta = venta.detalles.reduce((sum, detalle) => {
          const cantidad = Number(detalle.cantidad);
          const costo = Number(detalle.costoUnitario ?? 0);
          return sum + cantidad * costo;
        }, 0);
        return acc + costoVenta;
      }, 0);

      const cierre = manager.getRepository(CierreVenta).create({
        periodo: clavePeriodo,
        fechaInicio,
        fechaFin,
        totalCosto: totalCosto.toFixed(2),
        totalVenta: totalVenta.toFixed(2),
        totalGanancia: (totalVenta - totalCosto).toFixed(2),
        detalle: {
          ventas: ventas.map((venta) => ({ id: venta.id, total: venta.total })),
        },
      });

      return manager.getRepository(CierreVenta).save(cierre);
    });
  }
}
