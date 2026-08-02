import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

export enum EstadoPago {
  APROBADO = 'aprobado',
  RECHAZADO = 'rechazado',
  PENDIENTE = 'pendiente',
}

@Entity()
export class Pago {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 36 })
  reservaId!: string;

  @Column({ length: 100 })
  metodo!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  monto!: number;

  @Column({ type: 'enum', enum: EstadoPago, default: EstadoPago.APROBADO })
  estado!: EstadoPago;

  @Column({ type: 'datetime' })
  fechaPago!: Date;
}
