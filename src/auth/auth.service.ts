import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
  constructor(private userService: UserService) {}

  async validateWalletAddress(walletAddress: string) {
    // Check if user exists, if not create a new one
    let user = await this.userService.getUserByWalletAddress(walletAddress);
    
    if (!user) {
      user = await this.userService.createUser(walletAddress);
    }
    
    return user;
  }
}