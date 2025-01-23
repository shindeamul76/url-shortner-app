import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { AuthUser } from 'src/types/AuthUser';
import { PrismaService } from 'src/prisma/prisma.service';
import { mockDeep, mockReset } from 'jest-mock-extended';
import { USER_NOT_FOUND } from 'src/errors';
import * as E from 'fp-ts/Either';



const mockPrisma = mockDeep<PrismaService>();
let service: UserService;

const userService = new UserService(mockPrisma);

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

const users: AuthUser[] = [
 {
    id: 1,
    email: 'mockusre@tao.com',
    displayName: 'Mock User',
    photoURL: 'https://en.wikipedia.org/mockuser',
    refreshToken: 'hbfvdkhjbvkdvdfjvbnkhjb',
    lastLoggedOn: currentTime,
    createdAt: currentTime,
    currentRESTSession: {},
  },
 {
    id: 2,
    email: 'mockusre2@tao.com',
    displayName: 'Mock User',
    photoURL: 'https://en.wikipedia.org/mockuser',
    refreshToken: 'hbfvdkhjbvkdvdfjvbnkhjb',
    lastLoggedOn: currentTime,
    createdAt: currentTime,
    currentRESTSession: {},
  },
 {
    id: 3,
    email: 'mockusre3@tao.com',
    displayName: 'Mock User',
    photoURL: 'https://en.wikipedia.org/mockuser',
    refreshToken: 'hbfvdkhjbvkdvdfjvbnkhjb',
    lastLoggedOn: currentTime,
    createdAt: currentTime,
    currentRESTSession: {},
  },

];

beforeAll(() => {
  process.env.DATA_ENCRYPTION_KEY = '12345678901234567890123456789012';
});

afterAll(() => {
  delete process.env.DATA_ENCRYPTION_KEY;
});


beforeEach(() => {
  mockReset(mockPrisma);
  service = new UserService(mockPrisma);
});



const exampleSSOProfileData = {
  id: 1,
  emails: [{ value: 'mock@example.com' }],
  displayName: 'Mock',
  provider: 'google',
  photos: 'https://en.wikipedia.org/wiki/Dwight_Schrute',
};

describe('UserService', () => {

  describe('findUserByEmail', () => {
    test('should successfully return a valid user given a valid email', async () => {
      mockPrisma.user.findFirst.mockResolvedValueOnce(user);

      const result = await userService.findUserByEmail(
        'mockusre@tao.com',
      );
      expect(result).toEqual(user);
    });

    test('should return a null user given a invalid email', async () => {
      mockPrisma.user.findFirst.mockResolvedValueOnce(null);

      const result = await userService.findUserByEmail('mockusre@tao.com');
      expect(result).toBeNull();
    });
  });

  describe('findUserById', () => {
    test('should successfully return a valid user given a valid user uid', async () => {
      mockPrisma.user.findUniqueOrThrow.mockResolvedValueOnce(user);

      const result = await userService.findUserById(1);
      expect(result).toEqual(user);
    });

    test('should return a null user given a invalid user uid', async () => {
      mockPrisma.user.findUniqueOrThrow.mockRejectedValueOnce('NotFoundError');

      const result = await userService.findUserById(2);
      expect(result).resolves.toBeNull;
    });
  });

  describe('createUserSSO', () => {
    test('should successfully create user and account for SSO provider given valid inputs  ', async () => {
      mockPrisma.user.create.mockResolvedValueOnce(user);

      const result = await userService.createUserSSO(
        'sdcsdcsdc',
        'dscsdc',
        exampleSSOProfileData,
      );
      expect(result).toEqual(user);
    });

    test('should successfully create user and account for SSO provider given no displayName  ', async () => {
      mockPrisma.user.create.mockResolvedValueOnce({
        ...user,
        displayName: null,
      });

      const result = await userService.createUserSSO('sdcsdcsdc', 'dscsdc', {
        ...exampleSSOProfileData,
        displayName: null,
      });

      expect(result).toEqual({
        ...user,
        displayName: null,
      });
    });

    test('should successfully create user and account for SSO provider given no photoURL  ', async () => {
      mockPrisma.user.create.mockResolvedValueOnce({
        ...user,
        photoURL: null,
      });

      const result = await userService.createUserSSO('sdcsdcsdc', 'dscsdc', {
        ...exampleSSOProfileData,
        photoURL: null,
      });

      expect(result).toEqual({
        ...user,
        photoURL: null,
      });
    });
  });

  describe('createUserSSO', () => {
    test('should successfully create user and account for SSO provider given valid inputs  ', async () => {
      mockPrisma.user.create.mockResolvedValueOnce(user);

      const result = await userService.createUserSSO(
        'sdcsdcsdc',
        'dscsdc',
        exampleSSOProfileData,
      );
      expect(result).toEqual(user);
    });

    test('should successfully create user and account for SSO provider given no displayName  ', async () => {
      mockPrisma.user.create.mockResolvedValueOnce({
        ...user,
        displayName: null,
      });

      const result = await userService.createUserSSO('sdcsdcsdc', 'dscsdc', {
        ...exampleSSOProfileData,
        displayName: null,
      });

      expect(result).toEqual({
        ...user,
        displayName: null,
      });
    });

    test('should successfully create user and account for SSO provider given no photoURL  ', async () => {
      mockPrisma.user.create.mockResolvedValueOnce({
        ...user,
        photoURL: null,
      });

      const result = await userService.createUserSSO('sdcsdcsdc', 'dscsdc', {
        ...exampleSSOProfileData,
        photoURL: null,
      });

      expect(result).toEqual({
        ...user,
        photoURL: null,
      });
    });
  });

  describe('createProviderAccount', () => {
    test('should successfully create ProviderAccount for user given valid inputs ', async () => {
      mockPrisma.account.create.mockResolvedValueOnce({
        id: 1,
        userId: user.id,
        provider: exampleSSOProfileData.provider,
        providerAccountId: 'exampleSSOProfileData.id',
        providerRefreshToken: 'dscsdc',
        providerAccessToken: 'sdcsdcsdc',
        providerScope: 'user.email',
        loggedIn: currentTime,
      });

      const result = await userService.createProviderAccount(
        user,
        'sdcsdcsdc',
        'dscsdc',
        exampleSSOProfileData,
      );
      expect(result).toEqual({
        id: 1,
        userId: user.id,
        provider: exampleSSOProfileData.provider,
        providerAccountId: exampleSSOProfileData.id,
        providerRefreshToken: 'dscsdc',
        providerAccessToken: 'sdcsdcsdc',
        providerScope: 'user.email',
        loggedIn: currentTime,
      });
    });

    test('should successfully create ProviderAccount for user given no accessToken ', async () => {
      mockPrisma.account.create.mockResolvedValueOnce({
        id: 1,
        userId: user.id,
        provider: exampleSSOProfileData.provider,
        providerAccountId: 'exampleSSOProfileData.id',
        providerRefreshToken: 'dscsdc',
        providerAccessToken: null,
        providerScope: 'user.email',
        loggedIn: currentTime,
      });

      const result = await userService.createProviderAccount(
        user,
        'sdcsdcsdc',
        'dscsdc',
        exampleSSOProfileData,
      );
      expect(result).toEqual({
        id: 1,
        userId: user.id,
        provider: exampleSSOProfileData.provider,
        providerAccountId: exampleSSOProfileData.id,
        providerRefreshToken: 'dscsdc',
        providerAccessToken: null,
        providerScope: 'user.email',
        loggedIn: currentTime,
      });
    });

    test('should successfully create ProviderAccount for user given no refreshToken', async () => {
      mockPrisma.account.create.mockResolvedValueOnce({
        id: 1,
        userId: user.id,
        provider: exampleSSOProfileData.provider,
        providerAccountId: `exampleSSOProfileData.id`,
        providerRefreshToken: null,
        providerAccessToken: 'sdcsdcsdc',
        providerScope: 'user.email',
        loggedIn: currentTime,
      });

      const result = await userService.createProviderAccount(
        user,
        'sdcsdcsdc',
        'dscsdc',
        exampleSSOProfileData,
      );
      expect(result).toEqual({
        id: 1,
        userId: user.id,
        provider: exampleSSOProfileData.provider,
        providerAccountId: exampleSSOProfileData.id,
        providerRefreshToken: null,
        providerAccessToken: 'sdcsdcsdc',
        providerScope: 'user.email',
        loggedIn: currentTime,
      });
    });
  });

  describe('updateUserLastLoggedOn', () => {
    test('should resolve right and update user last logged on', async () => {
      const currentTime = new Date();
      mockPrisma.user.update.mockResolvedValueOnce({
        ...user,
        lastLoggedOn: currentTime,
      });

      const result = await userService.updateUserLastLoggedOn(user.id);
      expect(result).toEqual(E.right(true));
    });

    test('should resolve left and error when invalid user uid is passed', async () => {
      mockPrisma.user.update.mockRejectedValueOnce('NotFoundError');

      const result = await userService.updateUserLastLoggedOn(1);
      expect(result).toEqual(E.left(USER_NOT_FOUND));
    });
  });

  describe('fetchAllUsers', () => {
    test('should resolve right and return first 20 users when searchString is null', async () => {
      mockPrisma.user.findMany.mockResolvedValueOnce(users);

      const result = await userService.fetchAllUsers(null, {
        take: 20,
        skip: 0,
      });
      expect(result).toEqual(users);
    });
    test('should resolve right and return next 20 users when searchString is provided', async () => {
      mockPrisma.user.findMany.mockResolvedValueOnce(users);

      const result = await userService.fetchAllUsers('.com', {
        take: 20,
        skip: 0,
      });
      expect(result).toEqual(users);
    });
    test('should resolve left and return an empty array when users not found', async () => {
      mockPrisma.user.findMany.mockResolvedValueOnce([]);

      const result = await userService.fetchAllUsers('Unknown entry', {
        take: 20,
        skip: 0,
      });
      expect(result).toEqual([]);
    });
  });

  describe('getUsersCount', () => {
    test('should return count of all users in the organization', async () => {
      mockPrisma.user.count.mockResolvedValueOnce(10);

      const result = await userService.getUsersCount();
      expect(result).toEqual(10);
    });
  });



  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserService],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
