import { Controller, Get, UseGuards, Req, Patch, Param } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { Request } from 'express';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async list(
    @Req() req: Request & { user?: { id: string } },
  ): Promise<ReturnType<NotificationsService['listForUser']>> {
    const userId = req.user?.id as string;
    return this.notificationsService.listForUser(userId);
  }

  @Patch(':id/read')
  async markRead(@Param('id') id: string) {
    return this.notificationsService.markRead(id);
  }
}
