import { Controller, Post, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ScoringService } from './scoring.service';

@ApiTags('Scoring')
@ApiBearerAuth()
@Controller('scoring')
export class ScoringController {
  constructor(private readonly scoringService: ScoringService) {}

  @Post('calculate/:influencerId')
  @ApiOperation({ summary: 'Recalculate scores for an influencer profile' })
  calculate(@Param('influencerId') influencerId: string) {
    return this.scoringService.calculateScore(influencerId);
  }

  @Get('history/:influencerId')
  @ApiOperation({ summary: 'Get score history for an influencer' })
  history(@Param('influencerId') influencerId: string) {
    return this.scoringService.getScoreHistory(influencerId);
  }
}
