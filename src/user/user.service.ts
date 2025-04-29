import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class UserService {
  constructor(private databaseService: DatabaseService) {}

  async createUser(walletAddress: string) {
    try {
      const result = this.databaseService.run(
        'INSERT INTO users (wallet_address) VALUES (?)',
        [walletAddress]
      );
      return { id: result.lastInsertRowid, walletAddress };
    } catch (error) {
      // Check if user already exists
      if (error.message.includes('UNIQUE constraint failed')) {
        const existingUser = await this.getUserByWalletAddress(walletAddress);
        return existingUser;
      }
      throw error;
    }
  }

  async getUserById(id: number) {
    return this.databaseService.queryOne(
      'SELECT * FROM users WHERE id = ?',
      [id]
    );
  }

  async getUserByWalletAddress(walletAddress: string) {
    return this.databaseService.queryOne(
      'SELECT * FROM users WHERE wallet_address = ?',
      [walletAddress]
    );
  }

  async getAllUsers() {
    return this.databaseService.query(
      'SELECT * FROM users ORDER BY created_at DESC'
    );
  }

  async deleteUser(id: number) {
    return this.databaseService.run(
      'DELETE FROM users WHERE id = ?',
      [id]
    );
  }
}