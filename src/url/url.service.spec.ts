import { Test, TestingModule } from '@nestjs/testing';
import { UrlService } from './url.service';
import { PrismaService } from '../prisma/prisma.service';

import { ConfigService } from '@nestjs/config';
import * as E from 'fp-ts/Either';
import { mockDeep, mockReset } from 'jest-mock-extended';

import { CreateShortUrlDto } from './dto/create-short-url.dto';
import { AuthUser } from 'src/types/AuthUser';


const mockPrisma = mockDeep<PrismaService>();
const mockConfigService = mockDeep<ConfigService>();

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore

let service: UrlService;

const currentTime = new Date();

beforeEach(() => {
    mockReset(mockPrisma);
    service = new UrlService(mockPrisma, mockConfigService);
});

const createShortUrlDto: CreateShortUrlDto = {
    longUrl: 'http://example.com',
    shortAlias: 'abc123',
    topic: 'test',
};



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



describe('UrlService', () => {
    describe('createShortUrl', () => {
        test('should create a short URL successfully', async () => {

            const result = await service.createShortUrl(createShortUrlDto, user.id)
            mockConfigService.get.mockReturnValueOnce('http://short.url/');


            expect(result).toEqual(E.right({
                shortUrl: 'http://short.url/abc123',
                createdAt: expect.any(Date),
            }));
        });

        test('should return INVALID_URL error for invalid URL', async () => {
            const result = await service.createShortUrl({
                longUrl: 'invalid-url',
                shortAlias: null,
                topic: 'test',
            }, 1);

            expect(result).toEqual(E.left('INVALID_URL'));
        });
    });
    //     test('should return original URL and log analytics', async () => {
    //           mockPrisma.shortURL.findUnique.mockResolvedValueOnce({
    //             id: 1,
    //             longUrl: 'http://example.com',
    //           });
    //         mockPrisma.redirectLog.create.mockResolvedValueOnce({});

    //         const result = await service.getOriginalUrlAndLog(
    //             'abc123',
    //             'Mozilla/5.0',
    //             '127.0.0.1',
    //             { country: 'USA', region: 'CA', city: 'San Francisco' },
    //         );

    //         expect(result).toEqual(E.right('http://example.com'));
    //     });

    //     test('should return SHORT_URL_NOT_FOUND error for invalid alias', async () => {
    //         mockPrisma.shortURL.findUnique.mockResolvedValueOnce(null);

    //         const result = await service.getOriginalUrlAndLog(
    //             'invalid-alias',
    //             'Mozilla/5.0',
    //             '127.0.0.1',
    //             { country: 'Unknown', region: 'Unknown', city: 'Unknown' },
    //         );

    //         expect(result).toEqual(E.left('SHORT_URL_NOT_FOUND'));
    //     });
    // });
});


