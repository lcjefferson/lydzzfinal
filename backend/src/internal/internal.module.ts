import { Module } from '@nestjs/common';
import { InternalService } from './internal.service';
import { InternalController } from './internal.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';
import { ConversationsModule } from '../conversations/conversations.module';

@Module({
  imports: [PrismaModule, AuthModule, ConversationsModule],
  providers: [InternalService],
  controllers: [InternalController],
  exports: [InternalService],
})
export class InternalModule {}
