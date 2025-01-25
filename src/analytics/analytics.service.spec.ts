import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsService } from './analytics.service';


// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore

describe('AnalyticsService', () => {
  let service: AnalyticsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AnalyticsService],
    }).compile();

    service = module.get<AnalyticsService>(AnalyticsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
