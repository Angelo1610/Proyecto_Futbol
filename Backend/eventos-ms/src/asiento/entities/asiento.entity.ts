import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Fila } from "src/fila/entities/fila.entity";

export enum EstadoAsiento {
    DISPONIBLE = 'disponible',
    RESERVADO = 'reservado',
    VENDIDO = 'vendido'
}

export enum TipoAsiento {
    NORMAL = 'normal',
    PREFERENCIAL = 'preferencial',
}



@Entity()
export class Asiento {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({length:255,nullable:false})
    numero!:string;

    @Column({type:'enum', enum: TipoAsiento, default: TipoAsiento.NORMAL})
    tipo!: TipoAsiento;

    @Column({type:'enum', enum: EstadoAsiento, default: EstadoAsiento.DISPONIBLE})
    estado!: EstadoAsiento;

    @ManyToOne(() => Fila, (fila) => fila.asiento, {onDelete:'CASCADE'})
    fila!: Fila;


}
