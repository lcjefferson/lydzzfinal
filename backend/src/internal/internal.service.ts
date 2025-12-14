import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { randomUUID } from 'crypto';
import { ConversationsGateway } from '../conversations/conversations.gateway';

@Injectable()
export class InternalService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly gateway: ConversationsGateway,
  ) {}

  async ensureInternalChannel() {
    const org = await this.prisma.organization.findFirst();
    if (!org) throw new Error('No organization found');
    let channel = await this.prisma.channel.findFirst({
      where: { organizationId: org.id, type: 'internal' },
    });
    if (!channel) {
      channel = await this.prisma.channel.create({
        data: {
          type: 'internal',
          name: 'Internal',
          identifier: 'internal',
          status: 'active',
          organizationId: org.id,
        },
      });
    }
    return channel;
  }

  async listRooms() {
    const org = await this.prisma.organization.findFirst();
    if (!org) throw new Error('No organization found');
    const rooms = await this.prisma.conversation.findMany({
      where: { organizationId: org.id, channel: { type: 'internal' } },
      orderBy: { lastMessageAt: 'desc' },
      include: { messages: { orderBy: { createdAt: 'desc' }, take: 1 } },
    });
    return rooms.map((c) => ({
      id: c.id,
      name: c.contactName,
      lastMessageAt: c.lastMessageAt,
      lastMessage: c.messages?.[0]?.content || '',
    }));
  }

  async createRoom(name: string) {
    const channel = await this.ensureInternalChannel();
    const orgId = channel.organizationId;
    const conversation = await this.prisma.conversation.create({
      data: {
        contactName: name,
        contactIdentifier: `room:${randomUUID()}`,
        channelId: channel.id,
        organizationId: orgId,
      },
    });
    return conversation;
  }

  async getRoomMessages(roomId: string) {
    return this.prisma.message.findMany({
      where: { conversationId: roomId },
      orderBy: { createdAt: 'asc' },
      include: { user: true },
    });
  }

  async sendRoomMessage(roomId: string, userId: string, content: string) {
    const message = await this.prisma.message.create({
      data: {
        conversationId: roomId,
        userId,
        senderType: 'user',
        type: 'text',
        content,
      },
    });
    await this.prisma.conversation.update({
      where: { id: roomId },
      data: { lastMessageAt: new Date() },
    });
    this.gateway.emitNewMessage(roomId, message);
    return message;
  }

  private makeDMIdentifier(userA: string, userB: string) {
    const [x, y] = [userA, userB].sort((a, b) => (a > b ? 1 : -1));
    return `dm:${x}:${y}`;
  }

  async listDMs(currentUserId: string) {
    const org = await this.prisma.organization.findFirst();
    if (!org) throw new Error('No organization found');
    const conversations = await this.prisma.conversation.findMany({
      where: {
        organizationId: org.id,
        channel: { type: 'internal' },
        contactIdentifier: { startsWith: 'dm:' },
        OR: [{ contactIdentifier: { contains: currentUserId } }],
      },
      include: { messages: { orderBy: { createdAt: 'desc' }, take: 1 } },
      orderBy: { lastMessageAt: 'desc' },
    });
    return conversations.map((c) => ({
      id: c.id,
      name: c.contactName,
      lastMessageAt: c.lastMessageAt,
      lastMessage: c.messages?.[0]?.content || '',
    }));
  }

  async listUsers() {
    return this.prisma.user.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
      select: { id: true, name: true, email: true, role: true },
    });
  }

  async openDM(currentUserId: string, targetUserId: string) {
    const channel = await this.ensureInternalChannel();
    const orgId = channel.organizationId;
    const targetUser = await this.prisma.user.findUnique({
      where: { id: targetUserId },
    });
    if (!targetUser) throw new Error('Target user not found');
    const identifier = this.makeDMIdentifier(currentUserId, targetUserId);
    let conversation = await this.prisma.conversation.findFirst({
      where: { contactIdentifier: identifier, channelId: channel.id },
    });
    if (!conversation) {
      conversation = await this.prisma.conversation.create({
        data: {
          contactName: targetUser.name || 'Usuário',
          contactIdentifier: identifier,
          channelId: channel.id,
          organizationId: orgId,
        },
      });
    }
    return conversation;
  }

  async getDMMessages(conversationId: string) {
    return this.prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
      include: { user: true },
    });
  }

  async sendDMMessage(conversationId: string, userId: string, content: string) {
    const message = await this.prisma.message.create({
      data: {
        conversationId,
        userId,
        senderType: 'user',
        type: 'text',
        content,
      },
    });
    await this.prisma.conversation.update({
      where: { id: conversationId },
      data: { lastMessageAt: new Date() },
    });
    this.gateway.emitNewMessage(conversationId, message);
    return message;
  }

  async getDMInfo(conversationId: string, currentUserId: string) {
    const conv = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      select: { contactIdentifier: true },
    });
    if (!conv) throw new Error('Conversation not found');
    const ident = conv.contactIdentifier || '';
    const parts = ident.startsWith('dm:') ? ident.split(':').slice(1) : [];
    const targetId = parts.find((p) => p !== currentUserId) || parts[0] || '';
    if (!targetId) throw new Error('Target not found');
    const user = await this.prisma.user.findUnique({
      where: { id: targetId },
      select: { id: true, name: true, email: true, role: true },
    });
    if (!user) throw new Error('User not found');
    return user;
  }
}
