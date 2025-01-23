// import { Test, TestingModule } from '@nestjs/testing';
// import { UrlService } from './url.service';
// import { UrlController } from './url.controller';
// import { PrismaService } from 'src/prisma/prisma.service';
// import { ConfigService } from '@nestjs/config';
// import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
// import * as E from 'fp-ts/Either';
// import { mockDeep, mockReset } from 'jest-mock-extended';
// import { Response } from 'express';

// const mockPrisma = mockDeep<PrismaService>();
// const mockConfigService = mockDeep<ConfigService>();
// const mockResponse = {
//   redirect: jest.fn(),
//   status: jest.fn().mockReturnThis(),
//   send: jest.fn(),
// } as unknown as Response;

// let service: UrlService;
// let controller: UrlController;

// beforeEach(async () => {
//   mockReset(mockPrisma);
//   mockReset(mockConfigService);

//   const module: TestingModule = await Test.createTestingModule({
//     controllers: [UrlController],
//     providers: [UrlService, { provide: PrismaService, useValue: mockPrisma }, { provide: ConfigService, useValue: mockConfigService }],
//   }).compile();

//   service = module.get<UrlService>(UrlService);
//   controller = module.get<UrlController>(UrlController);
// });

// describe('UrlService', () => {
//   describe('createShortUrl', () => {
//     test('should create a short URL successfully', async () => {
//       mockPrisma.shortURL.create.mockResolvedValueOnce({
//         longUrl: 'http://example.com',
//         shortAlias: 'abc123',
//         topic: 'acquisition',  
//         userID: 1, 
//         createdAt: new Date(), 
//       });

//       mockConfigService.get.mockReturnValueOnce('http://short.url/');

//       const result = await service.createShortUrl({
//         longUrl: 'http://example.com',
//         shortAlias: 'abc123',
//         topic: 'acquisition',
//       }, 1);

//       expect(result).toEqual(E.right({
//         shortUrl: 'http://short.url/abc123',
//         createdAt: expect.any(Date),
//       }));
//     });

//     test('should return INVALID_URL error for invalid URL', async () => {
//       const result = await service.createShortUrl({
//         longUrl: 'invalid-url',
//         shortAlias: null,
//         topic: 'test',
//       }, 1);

//       expect(result).toEqual(E.left('INVALID_URL'));
//     });
//   });

//   describe('getOriginalUrlAndLog', () => {
//     test('should return original URL and log analytics', async () => {
//       mockPrisma.shortURL.findUnique.mockResolvedValueOnce({
//         id: 1,
//         longUrl: 'http://example.com',
//       });
//       mockPrisma.redirectLog.create.mockResolvedValueOnce({});

//       const result = await service.getOriginalUrlAndLog(
//         'abc123',
//         'Mozilla/5.0',
//         '127.0.0.1',
//         { country: 'USA', region: 'CA', city: 'San Francisco' },
//       );

//       expect(result).toEqual(E.right('http://example.com'));
//     });

//     test('should return SHORT_URL_NOT_FOUND error for invalid alias', async () => {
//       mockPrisma.shortURL.findUnique.mockResolvedValueOnce(null);

//       const result = await service.getOriginalUrlAndLog(
//         'invalid-alias',
//         'Mozilla/5.0',
//         '127.0.0.1',
//         { country: 'Unknown', region: 'Unknown', city: 'Unknown' },
//       );

//       expect(result).toEqual(E.left('SHORT_URL_NOT_FOUND'));
//     });
//   });
// });

// describe('UrlController', () => {
//   describe('createShortUrl', () => {
//     test('should create a short URL successfully', async () => {
//       const mockReq = { user: { id: 1 } };

//       jest.spyOn(service, 'createShortUrl').mockResolvedValueOnce(E.right({
//         shortUrl: 'http://short.url/abc123',
//         createdAt: new Date(),
//       }));

//       const result = await controller.createShortUrl({
//         longUrl: 'http://example.com',
//         shortAlias: 'abc123',
//         topic: 'test',
//       }, mockReq);

//       expect(result).toEqual(E.right({
//         shortUrl: 'http://short.url/abc123',
//         createdAt: expect.any(Date),
//       }));
//     });
//   });

//   describe('redirectToOriginalUrl', () => {
//     test('should redirect to original URL', async () => {
//       jest.spyOn(service, 'getOriginalUrlAndLog').mockResolvedValueOnce(E.right('http://example.com'));

//       await controller.redirectToOriginalUrl('abc123', { headers: { 'user-agent': 'Mozilla/5.0', 'x-forwarded-for': '127.0.0.1' } }, mockResponse);

//       expect(mockResponse.redirect).toHaveBeenCalledWith('http://example.com');
//     });

//     test('should return custom error HTML for invalid alias', async () => {
//       jest.spyOn(service, 'getOriginalUrlAndLog').mockResolvedValueOnce(E.left({
//         message: 'SHORT_URL_NOT_FOUND',
//         statusCode: 404,
//       }));

//       await controller.redirectToOriginalUrl('invalid-alias', { headers: { 'user-agent': 'Mozilla/5.0', 'x-forwarded-for': '127.0.0.1' } }, mockResponse);

//       expect(mockResponse.status).toHaveBeenCalledWith(404);
//       expect(mockResponse.send).toHaveBeenCalledWith(expect.any(String));
//     });
//   });
// });
