import { UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let users: UsersService;
  let auth: AuthService;

  beforeEach(() => {
    users = new UsersService();
    users.create('Ada@example.org', 'correct horse battery', 'Ada');
    auth = new AuthService(users);
  });

  it('returns an access token for valid credentials', () => {
    const result = auth.login('ada@example.org', 'correct horse battery');
    expect(result.memberId).toBe(1);
    expect(auth.memberForToken(result.accessToken)).toBe(1);
  });

  it('rejects a wrong password', () => {
    expect(() => auth.login('ada@example.org', 'wrong')).toThrow(UnauthorizedException);
  });

  it('rejects an unknown email', () => {
    expect(() => auth.login('nobody@example.org', 'correct horse battery')).toThrow(
      UnauthorizedException,
    );
  });
});
