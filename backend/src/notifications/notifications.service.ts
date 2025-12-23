import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, Notification } from '@prisma/client';
import { ConversationsGateway } from '../conversations/conversations.gateway';

@Injectable()
export class NotificationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly gateway: ConversationsGateway,
  ) {}

  async create(data: {
    type: string;
    entityId: string;
    userId: string;
    organizationId: string;
    data?: Record<string, unknown>;
  }): Promise<Notification> {
    const notification = await this.prisma.notification.create({
      data: {
        type: data.type,
        entityId: data.entityId,
        userId: data.userId,
        organizationId: data.organizationId,
        data: (data.data as Prisma.InputJsonValue) || {},
      },
    });
    this.gateway.emitNotificationCreated(notification);
    return notification;
  }

  async listForUser(userId: string): Promise<Notification[]> {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async markRead(id: string): Promise<Notification> {
    return this.prisma.notification.update({
      where: { id },
      data: { readAt: new Date() },
    });
  }
}
