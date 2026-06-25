import { Controller, Get, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { InstagramService } from './instagram.service';
import { Public } from '../auth/decorators/public.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../common/entities/user.entity';

@Controller('instagram')
export class InstagramController {
  constructor(private readonly instagramService: InstagramService) {}

  // Редирект на Instagram OAuth — принимает JWT как state
  @Public()
  @Get('connect')
  connect(@Query('state') state: string, @Res() res: Response) {
    const url = this.instagramService.getAuthUrl(state);
    return res.redirect(url);
  }

  // Callback от Instagram после авторизации
  @Public()
  @Get('callback')
  async callback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Res() res: Response,
  ) {
    try {
      await this.instagramService.handleCallback(code, state);
      return res.redirect(
        `${process.env.FRONTEND_URL}/profile?instagram=connected`,
      );
    } catch (e: any) {
      return res.redirect(
        `${process.env.FRONTEND_URL}/profile?instagram=error&msg=${encodeURIComponent(e.message)}`,
      );
    }
  }

  // Получить текущие данные Instagram авторизованного пользователя
  @Get('me')
  async getMe(@CurrentUser() user: User) {
    return this.instagramService.getInstagramData(user.id);
  }
}
