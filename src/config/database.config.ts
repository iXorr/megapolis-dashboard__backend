import { ConfigService } from "@nestjs/config";
import { TypeOrmModuleAsyncOptions } from "@nestjs/typeorm";

export const typeOrmConfig: TypeOrmModuleAsyncOptions = {
  inject: [ConfigService],
  useFactory: (config: ConfigService) => ({
    type: "postgres",
    host: config.getOrThrow<string>("DATABASE_HOST"),
    port: config.getOrThrow<number>("DATABASE_PORT"),
    username: config.getOrThrow<string>("DATABASE_USER"),
    password: config.getOrThrow<string>("DATABASE_PASSWORD"),
    database: config.getOrThrow<string>("DATABASE_NAME"),
    autoLoadEntities: true,
    synchronize: true,
  }),
};
