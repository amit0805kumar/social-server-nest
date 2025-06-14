import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Post, PostSchema } from './entities/post.schema';
import { UsersService } from 'src/users/users.service';
import { User, UserSchema } from 'src/users/entities/user.schema';

@Module({
  imports: [MongooseModule.forFeature([
    { name: Post.name, schema: PostSchema },
    { name: User.name, schema: UserSchema }
  ])],
  controllers: [PostsController],
  providers: [PostsService, UsersService],
})
export class PostsModule {}
