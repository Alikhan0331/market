import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { PricingService } from './pricing.service';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '../common/entities/user.entity';

@ApiTags('Pricing')
@ApiBearerAuth()
@Controller('pricing')
export class PricingController {
  constructor(private readonly pricingService: PricingService) {}

  @Get(':influencerId/breakdown')
  @ApiOperation({ summary: 'Get pricing factors breakdown — visible to both brand and influencer' })
  getBreakdown(@Param('influencerId') influencerId: string) {
    return this.pricingService.getPricingBreakdown(influencerId);
  }

  @Get(':influencerId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.BRAND)
  @ApiOperation({ summary: 'Get pricing zones (floor/recommended/high) — BRAND only' })
  getPricing(@Param('influencerId') influencerId: string) {
    return this.pricingService.calculatePricing(influencerId);
  }
}
