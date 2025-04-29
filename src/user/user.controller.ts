import { Controller, Post, Get, Delete, Body, Param } from '@nestjs/common';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @Post()
  async createUser(@Body() body: { walletAddress: string }) {
    return this.userService.createUser(body.walletAddress);
  }

  @Get()
  async getAllUsers() {
    return this.userService.getAllUsers();
  }

  @Get(':id')
  async getUserById(@Param('id') id: number) {
    return this.userService.getUserById(id);
  }

  @Get('wallet/:address')
  async getUserByWalletAddress(@Param('address') address: string) {
    return this.userService.getUserByWalletAddress(address);
  }

  @Delete(':id')
  async deleteUser(@Param('id') id: number) {
    return this.userService.deleteUser(id);
  }
}