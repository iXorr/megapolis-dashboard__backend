import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Category } from "./category.entity";
import { Transaction } from "./transaction.entity";

@Entity("skus")
export class Sku {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 255 })
  name!: string;

  @Column({ name: "category_id", type: "uuid" })
  categoryId!: string;

  @ManyToOne(() => Category, (cat) => cat.skus, { onDelete: "CASCADE" })
  @JoinColumn({ name: "category_id" })
  category!: Category;

  @Column({ type: "numeric", precision: 12, scale: 2 })
  price!: number;

  @Column({ type: "numeric", precision: 12, scale: 2 })
  cost!: number;

  @Column({ type: "varchar", length: 20, default: "pcs" })
  unit!: string;

  @OneToMany(() => Transaction, (tx) => tx.sku)
  transactions!: Transaction[];
}
