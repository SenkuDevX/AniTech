import { Module } from '@nestjs/common';
import { WatchPartyController } from './watch-party.controller';
import { WatchPartyService } from './watch-party.service';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [NotificationsModule],
  controllers: [WatchPartyController],
  providers: [WatchPartyService],
  exports: [WatchPartyService],
})
export class WatchPartyModule {}