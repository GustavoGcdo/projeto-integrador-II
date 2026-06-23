import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcryptjs';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';

jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
}));

describe('AuthService', () => {
  let authService: AuthService;
  const usersService = {
    findByEmail: jest.fn(),
  } as unknown as UsersService;
  const jwtService = {
    signAsync: jest.fn(),
  } as unknown as JwtService;
  const configService = {
    get: jest.fn((key: string) => {
      if (key === 'JWT_SECRET') return 'secret';
      if (key === 'JWT_EXPIRES_IN') return '12h';
      return undefined;
    }),
  } as unknown as ConfigService;

  beforeEach(() => {
    jest.clearAllMocks();
    authService = new AuthService(usersService, jwtService, configService);
  });

  it('rejects invalid credentials', async () => {
    const compareMock = compare as jest.MockedFunction<typeof compare>;
    (usersService.findByEmail as jest.Mock).mockResolvedValue({
      id: 1,
      name: 'Admin',
      email: 'admin@ecodescarte.local',
      passwordHash: 'hash',
      role: 'admin',
      active: true,
    });
    compareMock.mockResolvedValue(false);

    await expect(
      authService.login({
        email: 'admin@ecodescarte.local',
        password: '123456',
      }),
    ).rejects.toBeInstanceOf(UnauthorizedException);
  });

  it('returns a token for valid credentials', async () => {
    const compareMock = compare as jest.MockedFunction<typeof compare>;
    (usersService.findByEmail as jest.Mock).mockResolvedValue({
      id: 1,
      name: 'Admin',
      email: 'admin@ecodescarte.local',
      passwordHash: 'hash',
      role: 'admin',
      active: true,
    });
    compareMock.mockResolvedValue(true);
    (jwtService.signAsync as jest.Mock).mockResolvedValue('jwt-token');

    const result = await authService.login({
      email: 'admin@ecodescarte.local',
      password: '123456',
    });

    expect(result).toEqual({
      accessToken: 'jwt-token',
      user: {
        id: 1,
        name: 'Admin',
        email: 'admin@ecodescarte.local',
        role: 'admin',
      },
    });
  });
});
