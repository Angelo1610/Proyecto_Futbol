import { Evento } from "../../evento/entities/evento.entity";
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { OneToMany } from "typeorm/decorator/relations/OneToMany";
import { Seccion } from "../../seccion/entities/seccion.entity";


@Entity()
export class Escenario {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({length:255,nullable:false})
    nombre!:string;

    @Column({length:255,nullable:false})
    descripcion!:string;

    @Column({type:'varchar', length:255, nullable:false})
    ubicacion!:string;

    @Column({type:'int', nullable:false})
    capacidad!:number;

    @OneToMany(() => Evento, (evento) => evento.escenario)
    eventos!: Evento[];

    @OneToMany(() => Seccion, (seccion) => seccion.escenario)
    seccion!: Seccion[];
}
