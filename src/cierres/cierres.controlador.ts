import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { CierresServicio } from './cierres.servicio';
import { GenerarCierreDto } from './dto/generar-cierre.dto';
import { JwtAutenticacionGuard } from '../seguridad/guards/jwt.guard';
import { RolesGuard } from '../seguridad/guards/roles.guard';
import { Roles } from '../seguridad/roles.decorador';
import { RolUsuario } from '../usuarios/usuario.entidad';

@ApiTags('cierres')
@ApiBearerAuth('JWT')
@UseGuards(JwtAutenticacionGuard, RolesGuard)
@Controller('cierres')
export class CierresControlador {
  constructor(private readonly servicio: CierresServicio) {}

  @Get()
  @Roles(RolUsuario.ADMINISTRADOR, RolUsuario.SECRETARIA)
  @ApiQuery({ name: 'fechaInicio', required: false, type: String, description: 'Fecha en formato YYYY-MM-DD' })
  @ApiQuery({ name: 'fechaFin', required: false, type: String, description: 'Fecha en formato YYYY-MM-DD' })
  @ApiQuery({ name: 'search', required: false, type: String, description: 'Busqueda por periodo' })
  listar(
    @Query('fechaInicio') fechaInicio?: string,
    @Query('fechaFin') fechaFin?: string,
    @Query('search') search?: string,
  ) {
    return this.servicio.listar({ fechaInicio, fechaFin, search });
  }

  @Post()
  @Roles(RolUsuario.ADMINISTRADOR)
  generar(@Body() dto: GenerarCierreDto) {
    return this.servicio.generar(dto);
  }
}
