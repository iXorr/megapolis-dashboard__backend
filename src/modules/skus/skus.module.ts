import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Sku } from "../../database/entities/sku.entity";
import { SkusController } from "./skus.controller";
import { SkusService } from "./skus.service";

@Module({
  imports: [TypeOrmModule.forFeature([Sku])],
  controllers: [SkusController],
  providers: [SkusService],
  exports: [SkusService],
})
export class SkusModule {}
