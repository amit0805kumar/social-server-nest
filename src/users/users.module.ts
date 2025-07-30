import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UserSchema, User } from './entities/user.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { RedisModule } from 'src/redis.module';

@Module({
  imports: [MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]), RedisModule],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
