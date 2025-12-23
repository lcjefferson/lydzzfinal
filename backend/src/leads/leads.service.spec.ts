import { Test, TestingModule } from '@nestjs/testing';
import { LeadsService } from './leads.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';

describe('LeadsService', () => {
  let service: LeadsService;
  let prismaService: PrismaService;
  let notificationsService: NotificationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LeadsService,
        {
          provide: PrismaService,
          useValue: {
            lead: {
              findUnique: jest.fn(),
              update: jest.fn(),
            },
            comment: {
              create: jest.fn(),
            },
            leadHistory: {
              create: jest.fn(),
            },
          },
        },
        {
          provide: NotificationsService,
          useValue: {
            create: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<LeadsService>(LeadsService);
    prismaService = module.get<PrismaService>(PrismaService);
    notificationsService = module.get<NotificationsService>(NotificationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('addComment', () => {
    it('should add a comment and notify the assigned user if different from commenter', async () => {
      const leadId = 'lead-1';
      const userId = 'user-1'; // Commenter
      const assignedToId = 'user-2'; // Assignee
      const organizationId = 'org-1';
      const content = 'Test comment';

      const lead = {
        id: leadId,
        assignedToId,
        organizationId,
        name: 'Lead Name',
      };

      (prismaService.lead.findUnique as jest.Mock).mockResolvedValue(lead);
      (prismaService.lead.update as jest.Mock).mockResolvedValue(lead); // Mock update return

      await service.addComment(leadId, content, userId);

      expect(notificationsService.create).toHaveBeenCalledWith({
        type: 'lead_comment_added',
        entityId: leadId,
        userId: assignedToId,
        organizationId,
        data: {
          leadId,
          leadName: lead.name,
          commentContent: content,
          commentId: expect.any(String),
        },
      });
    });

    it('should NOT notify if the commenter is the assigned user', async () => {
      const leadId = 'lead-1';
      const userId = 'user-1'; // Commenter
      const assignedToId = 'user-1'; // Assignee (same)
      const organizationId = 'org-1';
      const content = 'Test comment';

      const lead = {
        id: leadId,
        assignedToId,
        organizationId,
        name: 'Lead Name',
      };

      (prismaService.lead.findUnique as jest.Mock).mockResolvedValue(lead);
      (prismaService.lead.update as jest.Mock).mockResolvedValue(lead); // Mock update return

      await service.addComment(leadId, content, userId);

      expect(notificationsService.create).not.toHaveBeenCalled();
    });
  });
});
