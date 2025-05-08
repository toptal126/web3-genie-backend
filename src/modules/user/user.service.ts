import { Injectable, NotFoundException } from '@nestjs/common';
import { UserModel } from './models/user.model';
import { User } from './models/user.schema';

@Injectable()
export class UserService {
  constructor(private userModel: UserModel) {}

  async createUser(walletAddress: string): Promise<User> {
    try {
      return await this.userModel.create(walletAddress);
    } catch (error) {
      // Check if user already exists
      if (error.code === 11000) {
        // MongoDB duplicate key error
        const existingUser = await this.getUserByWalletAddress(walletAddress);
        return existingUser;
      }
      throw error;
    }
  }

  async getUserById(id: string): Promise<User> {
    const user = await this.userModel.findById(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async getUserByWalletAddress(walletAddress: string): Promise<User> {
    const user = await this.userModel.findByWalletAddress(walletAddress);
    if (!user) {
      // create a new user
      return await this.createUser(walletAddress);
    }
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return this.userModel.findAll();
  }

  async deleteUser(id: string): Promise<boolean> {
    const deleted = await this.userModel.delete(id);
    if (!deleted) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return true;
  }
}
