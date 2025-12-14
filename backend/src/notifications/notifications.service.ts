import { Injectable } from '@nestjs/common';

type NotificationItem = {
  id: string;
  userId: string;
  type: string;
  createdAt: Date;
  readAt?: Date;
  entityId?: string;
  organizationId?: string;
  data?: Record<string, unknown>;
};

@Injectable()
export class NotificationsService {
  private store: NotificationItem[] = [];

  async listForUser(userId: string): Promise<NotificationItem[]> {
    await Promise.resolve();
    return this.store
      .filter((n) => n.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 100);
  }

  async markRead(id: string): Promise<NotificationItem | null> {
    await Promise.resolve();
    const idx = this.store.findIndex((n) => n.id === id);
    if (idx >= 0) {
      this.store[idx].readAt = new Date();
      return this.store[idx];
    }
    return null;
  }
}
