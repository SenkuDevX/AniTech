declare module 'passport-custom' {
  import { Request } from 'express';

  type VerifyFunction = (req: Request, done: (error: any, user?: any, info?: any) => void) => void;

  export class Strategy {
    name: string;
    constructor(verify: VerifyFunction);
    constructor(options: { passReqToCallback?: boolean }, verify: VerifyFunction);
    authenticate(req: Request, options?: any): void;
  }
}
