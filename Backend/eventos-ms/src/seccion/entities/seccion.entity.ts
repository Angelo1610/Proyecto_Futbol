import { Escenario } from "src/escenario/entities/escenario.entity";
import { Evento } from "src/evento/entities/evento.entity";
import { Fila } from "src/fila/entities/fila.entity";
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

export enum TipoSeccion {
    PALCO = 'palcos',
    TRIBUNA = 'tribunas',
    PREFERENCIA = 'preferencia',
    GENERAL = 'general'
}

@Entity()
export class Seccion {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column({length:255,nullable:false})
    nombre!:string;

    @Column({length:255 })
    descripcion!:string;

    @Column({type:'int',default:0})
    capacidad!:number;

    @Column({type:'enum', enum: TipoSeccion, default: TipoSeccion.GENERAL})
    tipo!: TipoSeccion;

    @Column({type:'decimal', precision:4, scale:2, default:1.0})
    multiplicador!:number;

    @ManyToOne(()=>Escenario,(escenario)=>escenario.seccion)
    escenario!:Escenario

    @OneToMany(()=>Fila,(fila)=>fila.seccion)
    fila!:Fila
}