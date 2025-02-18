import { CreateDateColumn, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

export abstract class BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;
    @CreateDateColumn({
        type:'timestamp',
        name:'create_at'
    })
    createAt:Date;
    @UpdateDateColumn({
        type:'timestamp',
        name:'updated_at'
    })
    updateAt:Date;
}