import { HttpStatus } from '@nestjs/common';

/**
 ** Custom interface to handle errors for REST modules such as Auth, User modules
 ** Since its REST we need to return the HTTP status code along with the error message
 */

export type RESTError = {
  message: string | Record<string, string>;
  statusCode: HttpStatus;
};
