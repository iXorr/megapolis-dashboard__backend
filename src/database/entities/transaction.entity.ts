import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Sku } from "./sku.entity";
import { Venue } from "./venue.entity";

@Entity("transactions")
export class Transaction {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ name: "venue_id", type: "uuid" })
  venueId!: string;

  @ManyToOne(() => Venue, (v) => v.transactions, { onDelete: "CASCADE" })
  @JoinColumn({ name: "venue_id" })
  venue!: Venue;

  @Column({ name: "sku_id", type: "uuid" })
  skuId!: string;

  @ManyToOne(() => Sku, (s) => s.transactions, { onDelete: "CASCADE" })
  @JoinColumn({ name: "sku_id" })
  sku!: Sku;

  @Column({ type: "integer" })
  quantity!: number;

  @Column({ type: "numeric", precision: 12, scale: 2 })
  revenue!: number;

  @Column({ type: "numeric", precision: 12, scale: 2 })
  cost!: number;

  @Column({ type: "timestamptz", name: "transacted_at" })
  transactedAt!: Date;
}
