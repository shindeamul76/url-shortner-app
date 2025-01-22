import { Controller, Get, Param, Post, Body, Patch, Delete, Query, Req } from '@nestjs/common';
import { UserService } from './user.service';
import { OffsetPaginationArgs } from 'src/types/input-types.args';
import * as E from 'fp-ts/Either';
import * as O from 'fp-ts/Option';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}


  /**
   * Get user by ID.
   * @param id User ID
   */
  @Get(':id')
  async getUserById(@Param('id') id: number) {
    const user = await this.userService.findUserById(id);
    return O.isSome(user) ? user.value : { message: 'User not found' };
  }



  /**
   * Fetch all users with pagination and optional search.
   * @param query Pagination and search parameters
   */
  @Get()
  async fetchAllUsers(@Query() query) {
    const { skip, take, searchString } = query;
    return await this.userService.fetchAllUsers(searchString, { skip, take });
  }

  /**
   * Get the total count of users.
   */
  @Get('count')
  async getUsersCount() {
    return { count: await this.userService.getUsersCount() };
  }

  /**
   * Delete a user account.
   * @param id User ID
   */
  @Delete(':id')
  async deleteUserAccount(@Param('id') id: number) {
    const result = await this.userService.deleteUserAccount(id);
    return E.isRight(result) ? { message: 'User deleted successfully' } : { message: result.left };
  }


}