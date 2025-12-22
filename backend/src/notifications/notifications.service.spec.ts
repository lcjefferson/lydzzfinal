import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsService } from './notifications.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConversationsGateway } from '../conversations/conversations.gateway';

describe('NotificationsService', () => {
  let service: NotificationsService;
  let prismaService: PrismaService;
  let gateway: ConversationsGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        {
          provide: PrismaService,
          useValue: {
            notification: {
              create: jest.fn(),
            },
          },
        },
        {
          provide: ConversationsGateway,
          useValue: {
            emitNotificationCreated: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
    prismaService = module.get<PrismaService>(PrismaService);
    gateway = module.get<ConversationsGateway>(ConversationsGateway);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a notification and emit an event', async () => {
      const data = {
        type: 'lead_comment_added',
        entityId: 'lead-1',
        userId: 'user-1',
        organizationId: 'org-1',
        data: { comment: 'hello' },
      };

      const createdNotification = {
        id: 'notif-1',
        ...data,
        createdAt: new Date(),
        readAt: null,
      };

      (prismaService.notification.create as jest.Mock).mockResolvedValue(createdNotification);

      const result = await service.create(data);

      expect(prismaService.notification.create).toHaveBeenCalledWith({
        data: {
          type: data.type,
          entityId: data.entityId,
          userId: data.userId,
          organizationId: data.organizationId,
          data: data.data,
        },
      });

      expect(gateway.emitNotificationCreated).toHaveBeenCalledWith(createdNotification);
      expect(result).toEqual(createdNotification);
    });
  });
});
