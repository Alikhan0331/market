import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ReliabilityService } from './reliability.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { User, UserRole } from '../common/entities/user.entity';

@ApiTags('Reliability')
@ApiBearerAuth()
@Controller('reliability')
export class ReliabilityController {
  constructor(private readonly reliabilityService: ReliabilityService) {}

  @Get('events/:influencerId')
  @ApiOperation({ summary: 'Get reliability events for an influencer' })
  getEvents(@Param('influencerId') influencerId: string) {
    return this.reliabilityService.getInfluencerEvents(influencerId);
  }

  @Post('no-response/:dealId')
  @UseGuards(RolesGuard)
  @Roles(UserRole.BRAND)
  @ApiOperation({ summary: 'Brand reports influencer did not respond to offer' })
  reportNoResponse(@Param('dealId') dealId: string, @CurrentUser() user: User) {
    return this.reliabilityService.reportNoResponse(dealId, user);
  }

  @Post('events/:eventId/dispute')
  @UseGuards(RolesGuard)
  @Roles(UserRole.INFLUENCER)
  @ApiOperation({ summary: 'Influencer opens a dispute for an event' })
  openDispute(
    @Param('eventId') eventId: string,
    @Body() body: { reason: string },
    @CurrentUser() user: User,
  ) {
    return this.reliabilityService.openDispute(eventId, body.reason, user);
  }

  @Get('disputes')
  @UseGuards(RolesGuard)
  @Roles(UserRole.MODERATOR, UserRole.ADMIN)
  @ApiOperation({ summary: 'Moderator: list all disputes' })
  getAllDisputes() {
    return this.reliabilityService.getAllDisputes();
  }

  @Patch('disputes/:id/resolve')
  @UseGuards(RolesGuard)
  @Roles(UserRole.MODERATOR, UserRole.ADMIN)
  @ApiOperation({ summary: 'Moderator: resolve dispute (UPHELD or DISMISSED)' })
  resolveDispute(
    @Param('id') id: string,
    @Body() body: { decision: 'UPHELD' | 'DISMISSED'; moderatorNote?: string },
  ) {
    return this.reliabilityService.resolveDispute(id, body.decision, body.moderatorNote);
  }
}
