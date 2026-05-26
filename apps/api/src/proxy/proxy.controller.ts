import { Controller, Get, Query, Res, Req, Header } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Response, Request } from 'express';
import { ProxyService } from './proxy.service';

@ApiTags('Proxy')
@Controller('proxy')
export class ProxyController {
  constructor(private readonly proxyService: ProxyService) {}

  @Get('stream')
  @ApiOperation({ summary: 'Proxy a media stream to bypass CORS and hide origin' })
  async stream(
    @Query('url') url: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    if (!url) return res.status(400).send('URL is required');

    const headers: Record<string, string> = {};
    if (req.headers['referer']) headers['Referer'] = req.headers['referer'] as string;
    if (req.headers['user-agent']) headers['User-Agent'] = req.headers['user-agent'] as string;
    if (req.headers['range']) headers['Range'] = req.headers['range'] as string;

    return this.proxyService.stream(url, headers, res);
  }
}
