import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { OrdenesServicio } from './ordenes.servicio';
import { CrearOrdenDto } from './dto/crear-orden.dto';
import { ActualizarOrdenDto } from './dto/actualizar-orden.dto';
import { CobrarOrdenDto } from './dto/cobrar-orden.dto';
import { CancelarOrdenDto } from './dto/cancelar-orden.dto';
import { JwtAutenticacionGuard } from '../seguridad/guards/jwt.guard';
import { RolesGuard } from '../seguridad/guards/roles.guard';
import { Roles } from '../seguridad/roles.decorador';
import { RolUsuario } from '../usuarios/usuario.entidad';
import { EstadoOrden } from './orden.entidad';

@ApiTags('ordenes')
@ApiBearerAuth('JWT')
@UseGuards(JwtAutenticacionGuard, RolesGuard)
@Controller('ordenes')
export class OrdenesControlador {
  constructor(private readonly servicio: OrdenesServicio) {}

  @Post()
  @Roles(RolUsuario.ADMINISTRADOR, RolUsuario.SECRETARIA, RolUsuario.VENDEDOR)
  crear(@Body() dto: CrearOrdenDto) {
    return this.servicio.crear(dto);
  }

  @Get()
  @Roles(RolUsuario.ADMINISTRADOR, RolUsuario.SECRETARIA, RolUsuario.VENDEDOR)
  @ApiQuery({ name: 'estado', required: false, enum: EstadoOrden })
  @ApiQuery({ name: 'fechaInicio', required: false, type: String, description: 'Fecha en formato YYYY-MM-DD o DD/MM/YYYY' })
  @ApiQuery({ name: 'fechaFin', required: false, type: String, description: 'Fecha en formato YYYY-MM-DD o DD/MM/YYYY' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Busqueda general por numero, cliente, vehiculo, etc.' })
  listar(
    @Query('estado') estado?: EstadoOrden,
    @Query('fechaInicio') fechaInicio?: string,
    @Query('fechaFin') fechaFin?: string,
    @Query('search') search?: string,
  ) {
    return this.servicio.listar({ estado, fechaInicio, fechaFin, search });
  }

  @Get(':id')
  @Roles(RolUsuario.ADMINISTRADOR, RolUsuario.SECRETARIA, RolUsuario.VENDEDOR)
  buscarPorId(@Param('id') id: string) {
    return this.servicio.buscarPorId(id);
  }

  @Patch(':id')
  @Roles(RolUsuario.ADMINISTRADOR, RolUsuario.SECRETARIA)
  actualizar(@Param('id') id: string, @Body() dto: ActualizarOrdenDto) {
    return this.servicio.actualizar(id, dto);
  }

  @Post(':id/cancelar')
  @Roles(RolUsuario.ADMINISTRADOR, RolUsuario.SECRETARIA)
  cancelar(@Param('id') id: string, @Body() dto: CancelarOrdenDto) {
    return this.servicio.cancelar(id, dto.motivo);
  }

  @Post(':id/finalizar')
  @Roles(RolUsuario.ADMINISTRADOR, RolUsuario.SECRETARIA)
  finalizar(@Param('id') id: string) {
    return this.servicio.finalizar(id);
  }

  @Post(':id/cobrar')
  @Roles(RolUsuario.ADMINISTRADOR, RolUsuario.SECRETARIA)
  cobrar(@Param('id') id: string, @Body() dto: CobrarOrdenDto) {
    return this.servicio.cobrar(id, dto);
  }
}
