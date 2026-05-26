import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { Response } from 'express';

@Injectable()
export class ProxyService {
  private readonly logger = new Logger(ProxyService.name);

  async stream(url: string, headers: Record<string, string>, res: Response) {
    try {
      const response = await axios.get(url, {
        headers: {
          ...headers,
          'User-Agent': headers['user-agent'] || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        },
        responseType: 'stream',
        timeout: 10000,
      });

      // Forward relevant headers
      const contentType = response.headers['content-type'];
      if (typeof contentType === 'string') res.setHeader('Content-Type', contentType);
      
      const cacheControl = response.headers['cache-control'];
      if (typeof cacheControl === 'string') res.setHeader('Cache-Control', cacheControl);

      // Handle M3U8/MPD manifest rewriting if needed
      if (url.endsWith('.m3u8') || (typeof contentType === 'string' && contentType.includes('application/vnd.apple.mpegurl'))) {
        let manifest = '';
        for await (const chunk of response.data) {
          manifest += chunk.toString();
        }
        
        const rewrittenManifest = this.rewriteManifest(manifest, url);
        res.send(rewrittenManifest);
        return;
      }

      response.data.pipe(res);
    } catch (error: any) {
      this.logger.error(`Proxy failed for ${url}: ${error?.message || 'Unknown error'}`);
      res.status(500).send('Proxy error');
    }
  }

  private rewriteManifest(manifest: string, baseUrl: string): string {
    const lines = manifest.split('\n');
    const base = baseUrl.substring(0, baseUrl.lastIndexOf('/') + 1);
    
    return lines.map(line => {
      if (line.startsWith('#') || !line.trim()) return line;
      
      // If it's a relative URL, make it absolute or point back to proxy
      if (!line.startsWith('http')) {
        const absoluteUrl = new URL(line, base).href;
        return `/v1/proxy/stream?url=${encodeURIComponent(absoluteUrl)}`;
      }
      
      return `/v1/proxy/stream?url=${encodeURIComponent(line)}`;
    }).join('\n');
  }
}
