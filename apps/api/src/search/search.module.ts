import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import { InfluencerProfile } from '../profiles/entities/influencer-profile.entity';

@Module({
  imports: [TypeOrmModule.forFeature([InfluencerProfile])],
  controllers: [SearchController],
  providers: [SearchService],
})
export class SearchModule {}
