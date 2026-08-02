import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum EstadoReserva {
  PENDIENTE = 'pendiente',
  CONFIRMADA = 'confirmada',
  CANCELADA = 'cancelada',
  EXPIRADA = 'expirada',

  /*actiava, cancelada, expirada*/ 
}

export interface DetalleAsientoReserva {
  asientoId: string;
  numeroAsiento: string;
  filaNombre: string;
  zona: string;
  precio: number;
}

@Entity()
export class Reserva {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 36 })
  usuarioId!: string;

  @Column({ type: 'varchar', length: 36 })
  eventoId!: string;

  @Column({ length: 255 })
  eventoNombre!: string;

  @Column({ length: 255 })
  eventoFechaHora!: string;

  @Column({ length: 255 })
  estadioNombre!: string;

  @Column({ type: 'enum', enum: EstadoReserva, default: EstadoReserva.PENDIENTE })
  estado!: EstadoReserva;

  @Column({ type: 'datetime' })
  fechaReserva!: Date;

  @Column({ type: 'datetime', nullable: true })
  expiraEn!: Date | null;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  montoTotal!: number;

  @Column({ type: 'json' })
  detalleAsientos!: DetalleAsientoReserva[];
}
