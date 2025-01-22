import { BadRequestException } from '@nestjs/common';

export class RateLimitExceededException extends BadRequestException {
  constructor(message: string) {
    super(message);
  }
}