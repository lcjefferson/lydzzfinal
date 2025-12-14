import { Module } from '@nestjs/common';
import { MediaController } from './media.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { IntegrationsModule } from '../integrations/integrations.module';

@Module({
  imports: [PrismaModule, IntegrationsModule],
  controllers: [MediaController],
})
export class MediaModule {}
