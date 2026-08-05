import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { typeOrmConfig } from "./config/database.config";
import { CategoriesModule } from "./modules/categories/categories.module";
import { DashboardModule } from "./modules/dashboard/dashboard.module";
import { SkusModule } from "./modules/skus/skus.module";
import { VenuesModule } from "./modules/venues/venues.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync(typeOrmConfig),
    VenuesModule,
    CategoriesModule,
    SkusModule,
    DashboardModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
