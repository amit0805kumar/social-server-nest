import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UserDto } from './dto/user.dto';
import { UUID } from 'crypto';
import {
  createErrorResponse,
  createResponse,
} from 'src/common/helpers/response.helpers';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Request } from 'express';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Body() createUserDto: UserDto) {
    try {
      const user = await this.usersService.create(createUserDto);
      return createResponse(user, 'User created successfully');
    } catch (error) {
      return createErrorResponse(error.message, 400);
    }
  }

  @Get()
  async findAll() {
    try {
      const users = await this.usersService.findAll();
      return createResponse(users, 'User fetched successfully');
    } catch (error) {
      return createErrorResponse(error.message, 400);
    }
  }

  @Get('profilePics')
  @UseGuards(JwtAuthGuard)
  async getAllProfilePics(@Req() req: Request) {
    try {
      const profilePics = await this.usersService.getAllUserProfilePicture();
      return createResponse(profilePics, 'Profile pictures fetched successfully');
    } catch (error) {
      return createErrorResponse(error.message, 400);
    }
  }
  
  @Get(':id')
  async findOne(@Param('id') id: UUID) {
    try {
      const user = await this.usersService.findOne(id);
      return createResponse(user, 'User fetched successfully');
    } catch (error) {
      return createErrorResponse(error.message, 400);
    }
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(@Param('id') id: UUID, @Body() updateUserDto: UserDto) {
    try {
      const user = await this.usersService.update(id, updateUserDto);
      return createResponse(user, 'User updated successfully');
    } catch (error) {
      return createErrorResponse(error.message, 400);
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: UUID) {
    return await this.usersService.remove(id);
  }

  @Patch('follow/:id')
  @UseGuards(JwtAuthGuard)
  async followUser(
    @Param('id') id: UUID,
    @Body('followUserId') followUserId: UUID,
  ) {
    try {
      const user = await this.usersService.followUser(id, followUserId);
      return createResponse(user, 'User followed successfully');
    } catch (error) {
      return createErrorResponse(error.message, 400);
    }
  }

  @Patch('unfollow/:id')
  @UseGuards(JwtAuthGuard)
  async unfollowUser(
    @Param('id') id: UUID,
    @Body('followUserId') followUserId: UUID,
  ) {
    try {
      const user = await this.usersService.unfollowUser(id, followUserId);
      return createResponse(user, 'User unfollowed successfully');
    } catch (error) {
      return createErrorResponse(error.message, 400);
    }
  }

  @Patch('change-password/:id')
  @UseGuards(JwtAuthGuard)
  async changePassword(
    @Body() body: { oldPassword: string; newPassword: string },
    @Param('id') id: UUID
  ) {
    try {
      const user = await this.usersService.changePassword(
        id,
        body.oldPassword,
        body.newPassword,
      );
      return createResponse(user, 'Password changed successfully');
    } catch (error) {
      console.error('Error changing password:', error);
      return createErrorResponse(error.message, 400);
    }
  }

  
}
