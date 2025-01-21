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
 * User update failure
 * (UserService)
 */
export const USER_UPDATE_FAILED = 'user/update_failed' as const;
