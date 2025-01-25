import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsController } from './analytics.controller';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore

describe('AnalyticsController', () => {
  let controller: AnalyticsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AnalyticsController],
    }).compile();

    controller = module.get<AnalyticsController>(AnalyticsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
