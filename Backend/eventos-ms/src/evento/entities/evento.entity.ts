import { Escenario } from "src/escenario/entities/escenario.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { JoinColumn } from "typeorm/decorator/relations/JoinColumn";

export enum EstadoEvento {
    PROGRAMADO = 'programado',
    EN_CURSO = 'en_curso',
    FINALIZADO = 'finalizado',
    CANCELADO = 'cancelado',
}

@Entity()
export class Evento {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column({length:255,nullable:false})
    nombre!:string;

    @Column({length:255,nullable:false})
    descripcion!:string;

    @Column({type:'date', nullable:false})
    fecha!:string;

    @Column({type:'time',nullable:false})
    hora!:string;

    @Column({type:'enum', enum: EstadoEvento, default: EstadoEvento.PROGRAMADO})
    estado!: EstadoEvento;

    @Column({type:'decimal', precision:10, scale:2, nullable:false, default:0})
    precioBase!:number;

    @Column({type:'varchar', length:500, nullable:true})
    imagenUrl!:string | null;

    @ManyToOne(() => Escenario, (escenario) => escenario.eventos)
    @JoinColumn()
    escenario!: Escenario;
}

