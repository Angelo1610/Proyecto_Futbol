import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum EstadoTicket {
  ACTIVO = 'activo',
  USADO = 'usado',
  CANCELADO = 'cancelado',
}

@Entity()
export class Ticket {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 20, unique: true })
  codigo!: string;

  @Column({ type: 'varchar', length: 36 })
  reservaId!: string;

  @Column({ type: 'varchar', length: 36 })
  usuarioId!: string;

  @Column({ type: 'varchar', length: 36 })
  asientoId!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  precio!: number;

  @Column({ type: 'enum', enum: EstadoTicket, default: EstadoTicket.ACTIVO })
  estado!: EstadoTicket;

  @Column({ length: 255 })
  eventoNombre!: string;

  @Column({ length: 255 })
  eventoFechaHora!: string;

  @Column({ length: 255 })
  estadioNombre!: string;

  @Column({ length: 255 })
  zona!: string;

  @Column({ length: 50 })
  numeroAsiento!: string;
}
