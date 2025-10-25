import { Controller, Get, Param, UseGuards, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { VentasServicio } from './ventas.servicio';
import { JwtAutenticacionGuard } from '../seguridad/guards/jwt.guard';
import { RolesGuard } from '../seguridad/guards/roles.guard';
import { Roles } from '../seguridad/roles.decorador';
import { RolUsuario } from '../usuarios/usuario.entidad';
import { EstadoVenta } from './venta.entidad';

@ApiTags('ventas')
@ApiBearerAuth('JWT')
@UseGuards(JwtAutenticacionGuard, RolesGuard)
@Controller('ventas')
export class VentasControlador {
  constructor(private readonly servicio: VentasServicio) {}

  @Get()
  @Roles(RolUsuario.ADMINISTRADOR, RolUsuario.SECRETARIA, RolUsuario.VENDEDOR)
  @ApiQuery({ name: 'fechaInicio', required: false, type: Date })
  @ApiQuery({ name: 'fechaFin', required: false, type: Date })
  @ApiQuery({ name: 'estado', required: false, enum: EstadoVenta })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Busqueda general por numero, cliente, usuario, etc.' })
  listar(
    @Query('fechaInicio') fechaInicio?: string,
    @Query('fechaFin') fechaFin?: string,
    @Query('estado') estado?: EstadoVenta,
    @Query('search') search?: string,
  ) {
    return this.servicio.listar({ fechaInicio, fechaFin, estado, search });
  }

  @Get(':id')
  @Roles(RolUsuario.ADMINISTRADOR, RolUsuario.SECRETARIA, RolUsuario.VENDEDOR)
  buscarPorId(@Param('id') id: string) {
    return this.servicio.buscarPorId(id);
  }
}
