import { Injectable } from '@nestjs/common';
import { UserDto } from './dto/user.dto';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from './entities/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { UUID } from 'crypto';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(createUserDto: UserDto): Promise<User> {
    try {
      const passwordHash = await bcrypt.hash(createUserDto.password, 10);
      createUserDto.password = passwordHash;
      return await this.userModel.create(createUserDto);
    } catch (error) {
      throw new Error(`Error creating user: ${error.message}`);
    };
  }

  async findAll(): Promise<User[]> {
    try {
      return await this.userModel.find().select('-password').exec();
    } catch (error) {
      throw new Error(`Error fetching users: ${error.message}`)
    }
  }

  async findOne(id: UUID): Promise<User> {
    const user = await this.userModel.findById(id).select('-password').exec();
    if (!user) {
      throw new Error(`User with id ${id} not found`);
    }
    return user;
  }

  async update(id: UUID, updateUserDto: UserDto): Promise<User> {
    const updatedUser = await this.userModel
      .findByIdAndUpdate(id, updateUserDto, {
        new: true,
        runValidators: true,
      }).select('-password')
      .exec();
    if (!updatedUser) {
      throw new Error(`User with id ${id} not found`);
    }
    return updatedUser;
  }

  remove(id: UUID) {
    return `This action removes a #${id} user`;
  }

  async followUser(userId: UUID, followUserId: UUID): Promise<User> {
    const user = await this.userModel.findById(userId);
    const followUser = await this.userModel.findById(followUserId);

    if (!user || !followUser) {
      throw new Error('User or follow user not found');
    }

    if (user.following && user.following.includes(followUserId)) {
      throw new Error('You are already following this user');
    }

    user?.following?.push(followUserId);
    followUser?.followers?.push(userId);

    await user.save();
    await followUser.save();

    return user;
  }
}
