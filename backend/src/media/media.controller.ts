import { Controller, Get, Param, Query, UseGuards, Res } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';
import { WhatsAppService } from '../integrations/whatsapp.service';
import type { Response } from 'express';
import axios, { AxiosResponse } from 'axios';

@Controller('media')
@UseGuards(JwtAuthGuard)
export class MediaController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly whatsappService: WhatsAppService,
  ) {}

  @Get('whatsapp/:mediaId')
  async proxyWhatsAppMedia(
    @Param('mediaId') mediaId: string,
    @Query('phoneNumberId') phoneNumberId: string | undefined,
    @Res() res: Response,
  ) {
    const channels = await this.prisma.channel.findMany({
      where: { type: 'whatsapp' },
    });
    let channel = channels[0] || null;
    if (phoneNumberId) {
      const matched = channels.find((ch) => {
        const cfg =
          typeof ch.config === 'object' && ch.config
            ? (ch.config as { phoneNumberId?: string })
            : undefined;
        return cfg?.phoneNumberId === phoneNumberId;
      });
      channel = matched || channel;
    }
    const accessToken = channel?.accessToken || undefined;
    if (!channel || !accessToken) {
      res.status(404).send('Channel not found');
      return;
    }

    const info = await this.whatsappService.getMediaInfo(mediaId, accessToken);
    const url = info?.url;
    if (!url) {
      res.status(404).send('Media not found');
      return;
    }

    const response: AxiosResponse<NodeJS.ReadableStream> = await axios.get(
      url,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
        responseType: 'stream',
      },
    );
    const ct = String(response.headers['content-type'] || '');
    const cl = String(response.headers['content-length'] || '');
    if (ct) {
      res.setHeader('Content-Type', ct);
    }
    if (cl) {
      res.setHeader('Content-Length', cl);
    }
    const stream = response.data;
    stream.pipe(res);
  }
}
