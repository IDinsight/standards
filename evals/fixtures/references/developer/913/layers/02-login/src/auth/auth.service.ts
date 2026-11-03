import { Injectable, UnauthorizedException } from '@nestjs/common';
import { randomBytes, timingSafeEqual } from 'node:crypto';
import { UsersService, hashPassword } from '../users/users.service';

export interface LoginResult {
  accessToken: string;
  memberId: number;
}

@Injectable()
export class AuthService {
  private readonly sessions = new Map<string, number>();

  constructor(private readonly users: UsersService) {}

  login(email: string, password: string): LoginResult {
    const member = this.users.findByEmail(email);
    if (!member) {
      throw new UnauthorizedException('Invalid email or password');
    }
    const candidate = Buffer.from(hashPassword(password, member.salt), 'hex');
    const stored = Buffer.from(member.passwordHash, 'hex');
    if (candidate.length !== stored.length || !timingSafeEqual(candidate, stored)) {
      throw new UnauthorizedException('Invalid email or password');
    }
    const accessToken = randomBytes(24).toString('base64url');
    this.sessions.set(accessToken, member.id);
    return { accessToken, memberId: member.id };
  }

  memberForToken(token: string): number | undefined {
    return this.sessions.get(token);
  }
}
