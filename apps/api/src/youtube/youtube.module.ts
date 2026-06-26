import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { YoutubeController } from './youtube.controller';
import { YoutubeService } from './youtube.service';
import { YoutubeApiService } from './youtube-api.service';
import { YoutubeCacheService } from './youtube-cache.service';
import { YoutubeOAuthService } from './youtube-oauth.service';
import { InfluencerProfile } from '../profiles/entities/influencer-profile.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([InfluencerProfile]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [YoutubeController],
  providers: [YoutubeService, YoutubeApiService, YoutubeCacheService, YoutubeOAuthService],
  exports: [YoutubeService],
})
export class YoutubeModule {}
