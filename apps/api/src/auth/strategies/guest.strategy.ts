import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-custom';
import { Request } from 'express';

@Injectable()
export class GuestStrategy extends PassportStrategy(Strategy, 'guest') {
  async validate(req: Request) {
    const guestToken = req.headers['x-guest-token'] as string;
    if (guestToken) {
      return { sub: guestToken, isGuest: true };
    }
    return { isGuest: true };
  }
}