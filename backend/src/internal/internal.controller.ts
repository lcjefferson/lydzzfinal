import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { InternalService } from './internal.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { Request } from 'express';

@Controller('internal')
@UseGuards(JwtAuthGuard)
export class InternalController {
  constructor(private readonly internalService: InternalService) {}

  @Get('rooms')
  listRooms() {
    return this.internalService.listRooms();
  }

  @Post('rooms')
  createRoom(@Body() body: { name: string }) {
    return this.internalService.createRoom(body.name);
  }

  @Get('rooms/:id/messages')
  getMessages(@Param('id') id: string) {
    return this.internalService.getRoomMessages(id);
  }

  @Post('rooms/:id/messages')
  sendMessage(
    @Param('id') id: string,
    @Body() body: { content: string },
    @Req() req: Request & { user?: { id: string } },
  ) {
    const userId = req.user?.id as string;
    return this.internalService.sendRoomMessage(id, userId, body.content);
  }

  @Get('users')
  async listUsers() {
    return this.internalService.listUsers();
  }

  @Get('dm')
  listDMs(@Req() req: Request & { user?: { id: string } }) {
    const userId = req.user?.id as string;
    return this.internalService.listDMs(userId);
  }

  @Post('dm')
  openDM(
    @Body() body: { targetUserId: string },
    @Req() req: Request & { user?: { id: string } },
  ) {
    const userId = req.user?.id as string;
    return this.internalService.openDM(userId, body.targetUserId);
  }

  @Get('dm/:id/messages')
  getDMMessages(@Param('id') id: string) {
    return this.internalService.getDMMessages(id);
  }

  @Post('dm/:id/messages')
  sendDMMessage(
    @Param('id') id: string,
    @Body() body: { content: string },
    @Req() req: Request & { user?: { id: string } },
  ) {
    const userId = req.user?.id as string;
    return this.internalService.sendDMMessage(id, userId, body.content);
  }
}
