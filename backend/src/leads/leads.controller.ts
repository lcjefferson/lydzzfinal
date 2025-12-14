import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';
import { LeadsService } from './leads.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('leads')
@UseGuards(JwtAuthGuard)
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Post()
  create(@Body() createLeadDto: CreateLeadDto) {
    return this.leadsService.create(createLeadDto);
  }

  @Get()
  findAll(
    @Query()
    query: {
      search?: string;
      temperature?: 'hot' | 'warm' | 'cold';
      status?:
        | 'Lead Novo'
        | 'Em Qualificação'
        | 'Qualificado (QUENTE)'
        | 'Reuniões Agendadas'
        | 'Proposta enviada (Follow-up)'
        | 'No Show (Não compareceu) (Follow-up)'
        | 'Contrato fechado';
      source?: string;
    },
    @Req()
    req: Request & {
      user?: { id: string; role: string; organizationId: string };
    },
  ) {
    const user = req.user as {
      id: string;
      role: string;
      organizationId: string;
    };
    return this.leadsService.findAll(
      query,
      user?.id,
      user?.role,
      user?.organizationId,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.leadsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateLeadDto: UpdateLeadDto,
    @Req() req: Request & { user?: { id: string } },
  ) {
    const userId = req.user?.id;
    return this.leadsService.update(id, updateLeadDto, userId);
  }

  @Post(':id/delegate')
  delegate(
    @Param('id') id: string,
    @Body() body: { assignedToId: string },
    @Req() req: Request & { user?: { id: string } },
  ) {
    const userId = req.user?.id;
    return this.leadsService.delegate(id, body.assignedToId, userId);
  }

  @Post(':id/tags')
  addTag(@Param('id') id: string, @Body() body: { tag: string }) {
    return this.leadsService.addTag(id, body.tag);
  }

  @Delete(':id/tags')
  removeTag(@Param('id') id: string, @Body() body: { tag: string }) {
    return this.leadsService.removeTag(id, body.tag);
  }

  @Post(':id/comments')
  addComment(
    @Param('id') id: string,
    @Body() body: { content: string; userId?: string },
  ) {
    return this.leadsService.addComment(id, body.content, body.userId);
  }

  @Get(':id/comments')
  getComments(@Param('id') id: string) {
    return this.leadsService.getComments(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.leadsService.remove(id);
  }
}
