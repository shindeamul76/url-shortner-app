import { HttpException } from "@nestjs/common";
import { RESTError } from "./types/RESTError";
import { ENV_NOT_FOUND_KEY_DATA_ENCRYPTION_KEY, JSON_INVALID } from "./errors";
import { CacheModuleAsyncOptions } from "@nestjs/cache-manager";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { redisStore } from "cache-manager-redis-store";

import * as crypto from 'crypto';
import * as O from 'fp-ts/Option';
import * as E from 'fp-ts/Either';
import { pass } from "fp-ts/lib/Writer";

import KeyvRedis from '@keyv/redis';
import { Keyv } from 'keyv';
import { CacheableMemory } from 'cacheable';

/**
 * A workaround to throw an exception in an expression.
 * JS throw keyword creates a statement not an expression.
 * This function allows throw to be used as an expression
 * @param errMessage Message present in the error message
 */
export function throwErr(errMessage: string): never {
    throw new Error(errMessage);
}



/**
 * This function allows throw to be used as an expression
 * @param errMessage Message present in the error message
 */
export function throwHTTPErr(errorData: RESTError): never {
    const { message, statusCode } = errorData;
    throw new HttpException(message, statusCode);
  }
  


/**
 * Encrypts a text using a key
 * @param text The text to encrypt
 * @param key The key to use for encryption
 * @returns The encrypted text
 */


export function encrypt(text: string, key = process.env.DATA_ENCRYPTION_KEY) {
    if (!key) throw new Error(ENV_NOT_FOUND_KEY_DATA_ENCRYPTION_KEY);
  
    if (text === null || text === undefined) return text;
  
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(
      ENCRYPTION_ALGORITHM,
      Buffer.from(key),
      iv,
    );
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
  }

  const ENCRYPTION_ALGORITHM = 'aes-256-cbc';
  
  /**
   * Decrypts a text using a key
   * @param text The text to decrypt
   * @param key The key to use for decryption
   * @returns The decrypted text
   */
  export function decrypt(
    encryptedData: string,
    key = process.env.DATA_ENCRYPTION_KEY,
  ) {
    if (!key) throw new Error(ENV_NOT_FOUND_KEY_DATA_ENCRYPTION_KEY);
  
    if (encryptedData === null || encryptedData === undefined) {
      return encryptedData;
    }
  
    const textParts = encryptedData.split(':');
    const iv = Buffer.from(textParts.shift(), 'hex');
    const encryptedText = Buffer.from(textParts.join(':'), 'hex');
    const decipher = crypto.createDecipheriv(
      ENCRYPTION_ALGORITHM,
      Buffer.from(key),
      iv,
    );
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  }
  

  /**
 * String to JSON parser
 * @param {str} str The string to parse
 * @returns {E.Right<T> | E.Left<"json_invalid">} An Either of the parsed JSON
 */
export function stringToJson<T>(
    str: string,
  ): E.Right<T | any> | E.Left<string> {
    try {
      return E.right(JSON.parse(str));
    } catch (err) {
      return E.left(JSON_INVALID);
    }
  }



  export const RedisOptions: CacheModuleAsyncOptions = {
    isGlobal: true,
    imports: [ConfigModule],
    useFactory: async (configService: ConfigService) => {
      return {
        stores: [
          new KeyvRedis(configService.get('REDIS_URL')),
        ],
      };
    },
    inject: [ConfigService],
  };

