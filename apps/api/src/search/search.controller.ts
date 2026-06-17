import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SearchService } from './search.service';
import { SearchInfluencersDto } from './dto/search-influencers.dto';

@ApiTags('Search')
@ApiBearerAuth()
@Controller('influencers')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @ApiOperation({ summary: 'Search and filter influencers' })
  search(@Query() dto: SearchInfluencersDto) {
    return this.searchService.searchInfluencers(dto);
  }
}
