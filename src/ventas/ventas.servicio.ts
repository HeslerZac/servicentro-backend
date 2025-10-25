import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { Venta, EstadoVenta } from './venta.entidad';
import { DetalleVenta } from './detalle-venta.entidad';
import { OrdenServicio } from '../ordenes/orden.entidad';
import { CajaSesion } from '../caja/caja.entidad';

@Injectable()
export class VentasServicio {
  constructor(
    @InjectRepository(Venta) private readonly ventasRepo: Repository<Venta>,
    private readonly dataSource: DataSource,
  ) {}

  listar(filtros: {
    fechaInicio?: string;
    fechaFin?: string;
    estado?: EstadoVenta;
    search?: string;
  }) {
    const qb = this.ventasRepo.createQueryBuilder('venta');

    qb.leftJoinAndSelect('venta.cliente', 'cliente');
    qb.leftJoinAndSelect('venta.usuario', 'usuario');
    qb.leftJoinAndSelect('venta.orden', 'orden');

    if (filtros.estado) {
      qb.andWhere('venta.estado = :estado', { estado: filtros.estado });
    }

    if (filtros.fechaInicio) {
      const inicio = new Date(filtros.fechaInicio);
      inicio.setHours(0, 0, 0, 0);
      qb.andWhere('venta.creadaEn >= :inicio', { inicio });
    }

    if (filtros.fechaFin) {
      const fin = new Date(filtros.fechaFin);
      fin.setHours(23, 59, 59, 999);
      qb.andWhere('venta.creadaEn <= :fin', { fin });
    }

    if (filtros.search) {
      const searchDate = this.parsearFecha(filtros.search);
      if (searchDate) {
        // If search term is a date, search within that day
        const inicioDia = new Date(searchDate);
        inicioDia.setHours(0, 0, 0, 0);
        const finDia = new Date(searchDate);
        finDia.setHours(23, 59, 59, 999);
        qb.andWhere('venta.creadaEn BETWEEN :inicioDia AND :finDia', {
          inicioDia,
          finDia,
        });
      } else {
        // If not a date, search in other fields
        const search = `%${filtros.search.toLowerCase()}%`;
        qb.andWhere(
          '(LOWER(venta.numero) LIKE :search OR ' +
            'LOWER(cliente.nombre) LIKE :search OR ' +
            'LOWER(usuario.nombre) LIKE :search)',
          { search },
        );
      }
    }

    qb.orderBy('venta.creadaEn', 'DESC');

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

  async buscarPorId(id: string) {
    return this.ventasRepo.findOne({
      where: { id },
      relations: [
        'cliente',
        'usuario',
        'orden',
        'detalles',
        'detalles.producto',
      ],
    });
  }

  async registrarDesdeOrden(
    orden: OrdenServicio,
    manager: EntityManager,
    pago?: {
      formaPago?: string;
      recibido?: number | null;
      cambio?: number | null;
    },
    cajaSesion?: CajaSesion | null,
  ) {
    const em = manager ?? this.dataSource.manager;
    const ventasRepo = em.getRepository(Venta);

    const detalles: DetalleVenta[] = [];
    for (const detalle of orden.detallesProducto) {
      detalles.push(
        em.getRepository(DetalleVenta).create({
          producto: detalle.producto,
          cantidad: detalle.cantidad,
          costoUnitario: detalle.costoUnitario ?? '0',
          precioUnitario: detalle.precioUnitario,
          subtotal: detalle.subtotal,
        }),
      );
    }
    for (const servicio of orden.detallesServicio) {
      detalles.push(
        em.getRepository(DetalleVenta).create({
          descripcion: servicio.descripcion,
          cantidad: '1.000',
          costoUnitario: servicio.costo,
          precioUnitario: servicio.precio,
          subtotal: servicio.precio,
        }),
      );
    }

    const subtotal = detalles.reduce((acc, d) => acc + Number(d.subtotal), 0);

    const venta = ventasRepo.create({
      numero: await this.generarNumeroUnico(ventasRepo),
      estado: pago ? EstadoVenta.PAGADA : EstadoVenta.ABIERTA,
      cliente: orden.cliente,
      usuario: orden.usuarioResponsable,
      orden,
      subtotal: String(subtotal),
      descuento: '0', // Placeholder
      impuestos: '0', // Placeholder
      total: orden.total,
      detalles,
      ...(cajaSesion ? { cajaSesion } : {}),
      ...(pago?.formaPago ? { formaPago: pago.formaPago } : {}),
      ...(pago?.recibido != null ? { recibido: String(pago.recibido) } : {}),
      ...(pago?.cambio != null ? { cambio: String(pago.cambio) } : {}),
    });

    return ventasRepo.save(venta);
  }

  private async generarNumeroUnico(repo: Repository<Venta>) {
    const hoy = new Date();
    const y = hoy.getFullYear();
    const m = String(hoy.getMonth() + 1).padStart(2, '0');
    const d = String(hoy.getDate()).padStart(2, '0');
    for (let i = 0; i < 5; i++) {
      const suf = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
      const numero = `V-${y}${m}${d}-${suf}`;
      const existe = await repo.findOne({ where: { numero } });
      if (!existe) return numero;
    }
    return `V-${y}${m}${d}-${Date.now().toString().slice(-6)}`;
  }
}
