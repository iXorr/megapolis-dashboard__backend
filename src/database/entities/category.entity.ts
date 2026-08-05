import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Sku } from "./sku.entity";

@Entity("categories")
export class Category {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 255 })
  name!: string;

  @OneToMany(() => Sku, (sku) => sku.category)
  skus!: Sku[];
}
