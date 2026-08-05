import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Transaction } from "./transaction.entity";

export enum VenueType {
  RESTAURANT = "restaurant",
  BAR = "bar",
  CINEMA = "cinema",
  FOOD_COURT = "food_court",
}

@Entity("venues")
export class Venue {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column({ type: "varchar", length: 255 })
  name!: string;

  @Column({ type: "enum", enum: VenueType })
  type!: VenueType;

  @Column({ type: "varchar", length: 100 })
  city!: string;

  @Column({ type: "text" })
  address!: string;

  @Column({ type: "numeric", precision: 10, scale: 7 })
  latitude!: number;

  @Column({ type: "numeric", precision: 10, scale: 7 })
  longitude!: number;

  @Column({ type: "date", nullable: true, name: "opened_at" })
  openedAt!: Date | null;

  @Column({
    type: "timestamptz",
    default: () => "now()",
    name: "created_at",
  })
  createdAt!: Date;

  @OneToMany(() => Transaction, (tx) => tx.venue)
  transactions!: Transaction[];
}
