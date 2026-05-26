import { Module } from '@nestjs/common';
import { LocalMediaController } from './local-media.controller';
import { LocalMediaService } from './local-media.service';

@Module({
  controllers: [LocalMediaController],
  providers: [LocalMediaService],
  exports: [LocalMediaService],
})
export class LocalMediaModule {}