import { Injectable } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { UpdateLeadDto } from './dto/update-lead.dto';
import { Lead, Prisma } from '@prisma/client';

@Injectable()
export class LeadsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsService: NotificationsService,
  ) {}

  async create(dto: CreateLeadDto): Promise<Lead> {
    const organization = await this.prisma.organization.findFirst();
    if (!organization) {
      throw new Error('No organization found to link lead');
    }

    return this.prisma.lead.create({
      data: {
        ...dto,
        organizationId: organization.id,
      },
    });
  }

  async findAll(
    filters?: {
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
    userId?: string,
    role?: string,
    _organizationId?: string,
  ): Promise<Lead[]> {
    void _organizationId;
    const where: Prisma.LeadWhereInput = {};
    if (filters?.temperature) where.temperature = filters.temperature;
    if (filters?.status) {
      const status = filters.status;
      const synonyms: Record<string, string[]> = {
        'Lead Novo': ['new'],
        'Em Qualificação': ['lost', 'qualific', 'qualificação'],
        'Qualificado (QUENTE)': ['quente', 'qualificado'],
        'Reuniões Agendadas': ['reuni', 'reunião', 'agendada'],
        'Proposta enviada (Follow-up)': ['proposta'],
        'No Show (Não compareceu) (Follow-up)': ['no show'],
        'Contrato fechado': ['converted', 'fechado', 'contrato'],
      };
      const or: Prisma.LeadWhereInput[] = [{ status }];
      const syns = synonyms[status] || [];
      syns.forEach((s) => {
        or.push({ status: s });
      });
      Object.assign(where, { OR: or });
    }
    if (filters?.source) where.source = filters.source;
    if (filters?.search) {
      const s = filters.search;
      Object.assign(where, {
        OR: [
          { name: { contains: s, mode: 'insensitive' } },
          { email: { contains: s, mode: 'insensitive' } },
          { company: { contains: s, mode: 'insensitive' } },
          { phone: { contains: s, mode: 'insensitive' } },
        ],
      });
    }

    const r = String(role || '').toLowerCase();
    if (r && r !== 'admin' && r !== 'manager') {
      where.assignedToId = userId;
    }

    return this.prisma.lead.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { assignedTo: true },
    });
  }

  async findOne(id: string): Promise<Lead | null> {
    return this.prisma.lead.findUnique({
      where: { id },
      include: { assignedTo: true },
    });
  }

  async update(id: string, dto: UpdateLeadDto, userId?: string): Promise<Lead> {
    void userId;
    const updated = await this.prisma.lead.update({ where: { id }, data: dto });
    return updated;
  }

  async delegate(
    id: string,
    assignedToId: string,
    userId?: string,
  ): Promise<Lead> {
    void userId;
    const updated = await this.prisma.lead.update({
      where: { id },
      data: { assignedToId },
      include: { assignedTo: true },
    });
    return updated;
  }

  async addTag(id: string, tag: string): Promise<Lead> {
    const lead = await this.prisma.lead.findUnique({ where: { id } });
    const cf = (lead?.customFields as Record<string, unknown>) || {};
    const existing = Array.isArray(cf.tags) ? (cf.tags as string[]) : [];
    const next = Array.from(new Set([...existing, tag])).filter(Boolean);
    return this.prisma.lead.update({
      where: { id },
      data: { customFields: { ...(cf || {}), tags: next } },
    });
  }

  async removeTag(id: string, tag: string): Promise<Lead> {
    const lead = await this.prisma.lead.findUnique({ where: { id } });
    const cf = (lead?.customFields as Record<string, unknown>) || {};
    const existing = Array.isArray(cf.tags) ? (cf.tags as string[]) : [];
    const next = existing.filter((t) => t !== tag);
    return this.prisma.lead.update({
      where: { id },
      data: { customFields: { ...(cf || {}), tags: next } },
    });
  }

  async addComment(
    id: string,
    content: string,
    userId?: string,
  ): Promise<Lead> {
    const lead = await this.prisma.lead.findUnique({ where: { id } });
    const cf = (lead?.customFields as Record<string, unknown>) || {};
    const now = new Date().toISOString();
    const newComment: {
      id: string;
      content: string;
      userId?: string;
      createdAt: string;
    } = {
      id: randomUUID(),
      content,
      userId,
      createdAt: now,
    };
    const existing: Array<{
      id: string;
      content: string;
      userId?: string;
      createdAt: string;
    }> = Array.isArray(cf.comments)
      ? (cf.comments as Array<{
          id: string;
          content: string;
          userId?: string;
          createdAt: string;
        }>)
      : [];
    const next: Array<{
      id: string;
      content: string;
      userId?: string;
      createdAt: string;
    }> = [...existing, newComment];

    const updatedLead = await this.prisma.lead.update({
      where: { id },
      data: {
        customFields: {
          ...(cf || {}),
          comments: next as unknown as Prisma.InputJsonValue,
        },
      },
    });

    if (lead?.assignedToId && lead.assignedToId !== userId) {
      await this.notificationsService.create({
        type: 'lead_comment_added',
        entityId: lead.id,
        userId: lead.assignedToId,
        organizationId: lead.organizationId,
        data: {
          leadId: lead.id,
          leadName: lead.name,
          commentContent: content,
          commentId: newComment.id,
        },
      });
    }

    return updatedLead;
  }

  async getComments(
    id: string,
  ): Promise<
    Array<{ id: string; content: string; userId?: string; createdAt: string }>
  > {
    const lead = await this.prisma.lead.findUnique({ where: { id } });
    const cf = (lead?.customFields as Record<string, unknown>) || {};
    const existing = Array.isArray(cf.comments)
      ? (cf.comments as Array<{
          id: string;
          content: string;
          userId?: string;
          createdAt: string;
        }>)
      : [];
    return existing;
  }

  async remove(id: string): Promise<Lead> {
    return this.prisma.lead.delete({ where: { id } });
  }
}
