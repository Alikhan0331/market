import { Controller, Get, Query, ParseIntPipe, DefaultValuePipe, Request } from '@nestjs/common';
import { MatchingService } from './matching.service';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';

@ApiTags('matching')
@ApiBearerAuth()
@Controller('matching')
export class MatchingController {
  constructor(private readonly matchingService: MatchingService) {}

  @Get('recommended')
  @ApiOperation({ summary: 'Get recommended influencers for the authenticated brand' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getRecommended(
    @Request() req: any,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.matchingService.getRecommended(req.user.sub, limit);
  }
}
