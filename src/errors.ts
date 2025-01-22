import exp from "constants";
import { StatusCodes } from "http-status-codes";

/**
 * Auth Provider not specified
 * (Auth)
 */
export const AUTH_PROVIDER_NOT_SPECIFIED = 'auth/provider_not_specified';


/**
 * Auth Provider not specified
 * (Auth)
 */
export const AUTH_PROVIDER_NOT_CONFIGURED =
  'auth/provider_not_configured_correctly';


/**
 * Tried to do an action on a user where user is not found
 */
export const USER_NOT_FOUND = 'user/not_found' as const;



/**
 * Invalid JSON
 * (Utils)
 */
export const JSON_INVALID = 'json_invalid';


/**
 * Environment variable "VITE_ALLOWED_AUTH_PROVIDERS" is not present in .env file
 */
export const ENV_NOT_FOUND_KEY_AUTH_PROVIDERS =
  '"VITE_ALLOWED_AUTH_PROVIDERS" is not present in .env file';

/**
 * Environment variable "DATA_ENCRYPTION_KEY" is not present in .env file
 */
export const ENV_NOT_FOUND_KEY_DATA_ENCRYPTION_KEY =
  '"DATA_ENCRYPTION_KEY" is not present in .env file';

/**
 * Environment variable "DATA_ENCRYPTION_KEY" is changed in .env file
 */
export const ENV_INVALID_DATA_ENCRYPTION_KEY =
  '"DATA_ENCRYPTION_KEY" value changed in .env file. Please undo the changes and restart the server';



/**
 * Refresh Token is malformed or invalid
 * (AuthService)
 */
export const INVALID_REFRESH_TOKEN = 'auth/invalid_refresh_token' as const;

/**
 * User update failure
 * (UserService)
 */
export const USER_UPDATE_FAILED = 'user/update_failed' as const;


/*
* Invalid URL
*/
export const LOGN_INVALID_URL = 'logn/invalid_url' as const;


/*  
* short alias already in use
*/
export const SHORTALIAS_ALREADY_IN_USE = 'shortalias/already_in_use' as const;


/*  
 * Rate limit exceeded
 */
export const RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded' as const;


/**
 * Failed to update rate limit
 */
export const FAILED_TO_UPDATE_RATE_LIMIT = 'failed_to_update_rate_limit' as const;


export const COOKIES_NOT_FOUND = 'cookie not fount';
export const INVALID_ACCESS_TOKEN = 'invalid access token';


/**
 * Short URL not found
 */
export const SHORT_URL_NOT_FOUND = 'short_url_not_found' as const;


export const Errors = {
  INVALID_URL: {
    message: LOGN_INVALID_URL,
    statusCode: StatusCodes.BAD_REQUEST,
  },
  SHORT_ALIAS_IN_USE: {
    message: SHORTALIAS_ALREADY_IN_USE,
    statusCode: StatusCodes.BAD_REQUEST,
  },
  RATE_LIMIT_EXCEEDED: {
    message: RATE_LIMIT_EXCEEDED,
    statusCode: StatusCodes.TOO_MANY_REQUESTS,
  },
  SHORT_URL_NOT_FOUND: {
    message: SHORT_URL_NOT_FOUND,
    statusCode: StatusCodes.BAD_REQUEST,
  },
};