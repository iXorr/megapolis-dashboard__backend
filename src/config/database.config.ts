import { ConfigService } from "@nestjs/config";
import { TypeOrmModuleAsyncOptions } from "@nestjs/typeorm";
import { Category } from "../database/entities/category.entity";
import { Sku } from "../database/entities/sku.entity";
import { Transaction } from "../database/entities/transaction.entity";
import { Venue } from "../database/entities/venue.entity";

export const typeOrmConfig: TypeOrmModuleAsyncOptions = {
  inject: [ConfigService],
  useFactory: (config: ConfigService) => ({
    type: "postgres",
    host: config.getOrThrow<string>("DATABASE_HOST"),
    port: config.getOrThrow<number>("DATABASE_PORT"),
    username: config.getOrThrow<string>("DATABASE_USER"),
    password: config.getOrThrow<string>("DATABASE_PASSWORD"),
    database: config.getOrThrow<string>("DATABASE_NAME"),
    entities: [Venue, Category, Sku, Transaction],
    autoLoadEntities: true,
    synchronize: true,
  }),
};
