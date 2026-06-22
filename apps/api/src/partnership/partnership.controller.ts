import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { PartnershipService } from './partnership.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../common/entities/user.entity';

@ApiTags('Partnership')
@ApiBearerAuth()
@Controller('partnerships')
export class PartnershipController {
  constructor(private readonly partnershipService: PartnershipService) {}

  @Get('pair/:influencerId')
  @ApiOperation({ summary: 'Get partnership between current brand and an influencer' })
  getPair(@Param('influencerId') influencerId: string, @CurrentUser() user: User) {
    // Brand's userId is in user.id; we need brandId — resolved via influencer param
    // Return raw, let frontend handle missing
    return this.partnershipService.getPairByUserId(user.id, influencerId);
  }

  @Get('brand')
  @ApiOperation({ summary: 'Get all partnerships for current brand' })
  getForBrand(@CurrentUser() user: User) {
    return this.partnershipService.getForBrandByUserId(user.id);
  }

  @Get('influencer')
  @ApiOperation({ summary: 'Get all partnerships for current influencer' })
  getForInfluencer(@CurrentUser() user: User) {
    return this.partnershipService.getForInfluencerByUserId(user.id);
  }
}
