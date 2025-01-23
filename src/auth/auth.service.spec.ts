import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { mockDeep, mockFn } from 'jest-mock-extended';
import { AuthUser } from 'src/types/AuthUser';
import * as E from 'fp-ts/Either';
import { INVALID_REFRESH_TOKEN, USER_NOT_FOUND } from 'src/errors';
import { StatusCodes } from 'http-status-codes';


const mockPrisma = mockDeep<PrismaService>();
const mockUser = mockDeep<UserService>();
const mockJWT = mockDeep<JwtService>();
const mockConfigService = mockDeep<ConfigService>();


const authService = new AuthService(
  mockUser,
  mockJWT,
  mockPrisma,
  mockConfigService,
);



const currentTime = new Date();

const user: AuthUser = {
  id: 1,
  email: 'mockusre@tao.com',
  displayName: 'Mock User',
  photoURL: 'https://en.wikipedia.org/mockuser',
  refreshToken: 'hbfvdkhjbvkdvdfjvbnkhjb',
  lastLoggedOn: currentTime,
  createdAt: currentTime,
  currentRESTSession: {},
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthService],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});


describe('generateAuthTokens', () => {

  test('Should successfully generate tokens with valid inputs', async () => {

    mockJWT.sign.mockReturnValue(user.refreshToken);

    mockUser.updateUserRefreshToken.mockResolvedValueOnce(E.right(user));

    const result = await authService.generateAuthTokens(user.id);

    expect(result).toEqual(E.right({
      access_token: 'hbfvdkhjbvkdvdfjvbnkhjb',
      refresh_token: 'hbfvdkhjbvkdvdfjvbnkhjb',
    }));

  })


  test('Should throw USER_NOT_FOUND when updating refresh tokens fails', async () => {
    mockJWT.sign.mockReturnValue(user.refreshToken);
    // UpdateUserRefreshToken
    mockUser.updateUserRefreshToken.mockResolvedValueOnce(
      E.left(USER_NOT_FOUND),
    );

    const result = await authService.generateAuthTokens(user.id);
    expect(result).toEqual(E.right({
      message: USER_NOT_FOUND,
      statusCode: StatusCodes.NOT_FOUND,
    }));
  })

})

jest.mock('argon2', () => {
  return {
    verify: jest.fn((x, y) => {
      if (y === null) return false;
      return true;
    }),
    hash: jest.fn(),
  };
});



describe('refreshAuthTokens', () => {
  test('Should throw USER_NOT_FOUND when updating refresh tokens fails', async () => {
    // generateAuthTokens
    mockJWT.sign.mockReturnValue(user.refreshToken);
    // UpdateUserRefreshToken
    mockUser.updateUserRefreshToken.mockResolvedValueOnce(
      E.left(USER_NOT_FOUND),
    );

    const result = await authService.refreshAuthTokens(
      '$argon2id$v=19$m=65536,t=3,p=4$MvVOam2clCOLtJFGEE26ZA$czvA5ez9hz+A/LML8QRgqgaFuWa5JcbwkH6r+imTQbs',
      user,
    );
    expect(result).toEqual(E.right({
      message: USER_NOT_FOUND,
      statusCode: StatusCodes.NOT_FOUND,
    }));
  });

  test('Should throw USER_NOT_FOUND when user is invalid', async () => {
    const result = await authService.refreshAuthTokens(
      'jshdcbjsdhcbshdbc',
      null,
    );
    expect(result).toEqual(E.right({
      message: USER_NOT_FOUND,
      statusCode: StatusCodes.NOT_FOUND,
    }));
  });

  test('Should successfully refresh the tokens and generate a new auth token pair', async () => {
    // generateAuthTokens
    mockJWT.sign.mockReturnValue('sdhjcbjsdhcbshjdcb');
    // UpdateUserRefreshToken
    mockUser.updateUserRefreshToken.mockResolvedValueOnce(
      E.right({
        ...user,
        refreshToken: 'sdhjcbjsdhcbshjdcb',
      }),
    );

    const result = await authService.refreshAuthTokens(
      '$argon2id$v=19$m=65536,t=3,p=4$MvVOam2clCOLtJFGEE26ZA$czvA5ez9hz+A/LML8QRgqgaFuWa5JcbwkH6r+imTQbs',
      user,
    );
    expect(result).toEqual(E.right({
      access_token: 'sdhjcbjsdhcbshjdcb',
      refresh_token: 'sdhjcbjsdhcbshjdcb',
    }));
  });

  test('Should throw INVALID_REFRESH_TOKEN when the refresh token is invalid', async () => {
    // generateAuthTokens
    mockJWT.sign.mockReturnValue('sdhjcbjsdhcbshjdcb');
    mockPrisma.user.update.mockResolvedValueOnce({
      ...user,
      refreshToken: 'sdhjcbjsdhcbshjdcb',
    });

    const result = await authService.refreshAuthTokens(null, user);
    expect(result).toEqual(E.right({
      message: INVALID_REFRESH_TOKEN,
      statusCode: StatusCodes.NOT_FOUND,
    }));
  });
});
