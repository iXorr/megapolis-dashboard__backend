import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Transaction } from "../../database/entities/transaction.entity";
import { Venue } from "../../database/entities/venue.entity";
import { DashboardController } from "./dashboard.controller";
import { DashboardService } from "./dashboard.service";

@Module({
  imports: [TypeOrmModule.forFeature([Transaction, Venue])],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
