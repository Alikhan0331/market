import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DealsController } from './deals.controller';
import { DealsService } from './deals.service';
import { Deal } from './entities/deal.entity';
import { ProfilesModule } from '../profiles/profiles.module';
import { ReliabilityModule } from '../reliability/reliability.module';
import { PricingModule } from '../pricing/pricing.module';
import { PartnershipModule } from '../partnership/partnership.module';

@Module({
  imports: [TypeOrmModule.forFeature([Deal]), ProfilesModule, ReliabilityModule, PricingModule, PartnershipModule],
  controllers: [DealsController],
  providers: [DealsService],
})
export class DealsModule {}
