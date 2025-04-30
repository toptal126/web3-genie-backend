import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../../database/schemas/user.schema';

@Injectable()
export class UserModel {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async create(walletAddress: string): Promise<User> {
    const user = new this.userModel({ wallet_address: walletAddress });
    return user.save();
  }

  async findById(id: string): Promise<User | null> {
    return this.userModel.findById(id).exec();
  }

  async findByWalletAddress(walletAddress: string): Promise<User | null> {
    return this.userModel.findOne({ wallet_address: walletAddress }).exec();
  }

  async findAll(): Promise<User[]> {
    return this.userModel.find().sort({ createdAt: -1 }).exec();
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.userModel.findByIdAndDelete(id).exec();
    return !!result;
  }
} 