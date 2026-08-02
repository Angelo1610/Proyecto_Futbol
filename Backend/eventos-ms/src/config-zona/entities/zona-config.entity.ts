import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { TipoSeccion } from '../../seccion/entities/seccion.entity';

@Entity()
export class ZonaConfig {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'enum', enum: TipoSeccion, unique: true })
  tipo!: TipoSeccion;

  @Column({ length: 255, nullable: false })
  nombre!: string;

  @Column({ type: 'decimal', precision: 4, scale: 2, default: 1.0 })
  multiplicador!: number;
}
