import "dotenv/config";
import { DataSource } from "typeorm";
import { Category, Sku, Transaction, Venue } from "./entities";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DATABASE_HOST ?? "localhost",
  port: Number(process.env.DATABASE_PORT) || 5432,
  username: process.env.DATABASE_USER ?? "dashboard",
  password: process.env.DATABASE_PASSWORD ?? "dashboard",
  database: process.env.DATABASE_NAME ?? "dashboard",
  entities: [Venue, Category, Sku, Transaction],
  synchronize: true,
});
