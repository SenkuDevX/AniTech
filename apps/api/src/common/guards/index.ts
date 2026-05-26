import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

export class JwtAuthGuard extends AuthGuard('jwt') {}
export class LocalAuthGuard extends AuthGuard('local') {}
export class GuestAuthGuard extends AuthGuard('guest') {}