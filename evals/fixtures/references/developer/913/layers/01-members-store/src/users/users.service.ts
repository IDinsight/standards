import { Injectable } from '@nestjs/common';
import { randomBytes, scryptSync } from 'node:crypto';

export interface Member {
  id: number;
  email: string;
  displayName: string;
  salt: string;
  passwordHash: string;
}

export function hashPassword(password: string, salt: string): string {
  return scryptSync(password, salt, 32).toString('hex');
}

@Injectable()
export class UsersService {
  private readonly members = new Map<string, Member>();
  private nextId = 1;

  create(email: string, password: string, displayName: string): Member {
    const salt = randomBytes(16).toString('hex');
    const member: Member = {
      id: this.nextId++,
      email: email.trim().toLowerCase(),
      displayName,
      salt,
      passwordHash: hashPassword(password, salt),
    };
    this.members.set(member.email, member);
    return member;
  }

  findByEmail(email: string): Member | undefined {
    return this.members.get(email.trim().toLowerCase());
  }
}
