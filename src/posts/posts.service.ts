import { Injectable } from '@nestjs/common';
import { PostDto } from './dto/post.dto';
import {Post, PostDocument} from './entities/post.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UUID } from 'crypto';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class PostsService {
  constructor(@InjectModel(Post.name) private postModel: Model<PostDocument>,
    private readonly userService: UsersService
) {}
  
  async create(createPostDto: PostDto): Promise<Post> {
    if (!createPostDto || !createPostDto.userId) {
      throw new Error('User ID is required to create a post');
    }
    try {      
      return await this.postModel.create(createPostDto);
    } catch (error) {
      throw new Error(`Error creating post: ${error.message}`);  
    }
  }

  async findAll(_id?: UUID): Promise<Post[]> {
    try {
      if (!_id) {
        throw new Error('User ID is required to fetch posts');
      }
      return await this.postModel.find({ userId: _id }).sort({ createdAt: -1 }).exec();
    } catch (error) {
      throw new Error(`Error fetching posts: ${error.message}`);
    }
  }

  async findUserPosts(_id: UUID): Promise<Post[]> {
    try {
      if (!_id) {
        throw new Error('User ID is required to fetch user posts');
      }
      const posts = await this.postModel.find({ userId: _id }).sort({ createdAt: -1 }).exec();
      if (!posts || posts.length === 0) {
        throw new Error(`No posts found for user with id ${_id}`);
      }
      return posts;
    } catch (error) {
      throw new Error(`Error fetching user posts with id ${_id}: ${error.message}`);
    }
  }

  async findOne(_id: UUID): Promise<Post> {
    try {
      if (!_id) {
        throw new Error('Post ID is required to fetch a post');
      }
      const post = await this.postModel.findById(_id).exec();
      if (!post) {
        throw new Error(`Post with id ${_id} not found`);
      }
      return post;
    } catch (error) {
      throw new Error(`Error fetching post with id ${_id}: ${error.message}`); 
    }
  }

  async update(_id: UUID, updatePostDto: PostDto): Promise<Post> {
    if (!_id || !updatePostDto) {
      throw new Error('Post ID and update data are required to update a post');
    }
    if (!updatePostDto.userId) {
      throw new Error('User ID is required to update a post');
    }
    if (updatePostDto.userId !== updatePostDto.userId) {
      throw new Error('User ID mismatch: You can only update your own posts');
    }
    try {
      updatePostDto._id = _id; // Ensure the ID is set in the update DTO
      const updatedPost = await this.postModel.findByIdAndUpdate(
        _id,
        updatePostDto,
        {
          new: true,
          runValidators: true,
        },
      ).exec();
      if (!updatedPost) {
        throw new Error(`Post with id ${_id} not found`);
      }
      return updatedPost;
    } catch (error) {
      throw new Error(`Error updating post with id ${_id}: ${error.message}`);
    }
  }

  async findFollowingPosts(followingIds: UUID[]): Promise<Post[]> {
    if (!followingIds || followingIds.length === 0) {
      throw new Error('Following IDs are required to fetch following posts');
    }
    try {
      return await this.postModel.find({ userId: { $in: followingIds } }).sort({ createdAt: -1 }).exec();
    } catch (error) {
      throw new Error(`Error fetching following posts: ${error.message}`);
    }
  }

  async findTimelinePosts(_id: UUID): Promise<Post[]> {

    try {
      const posts = await this.findAll(_id);
      const user = await this.userService.findOne(_id);

       if(user.following && user.following.length > 0) {
              const followingPosts = await this.findFollowingPosts(user.following);
                return [...posts, ...followingPosts].sort((a, b) => b?.createdAt?.getTime() - a?.createdAt?.getTime());
        }
        return posts
    } catch (error) {
      throw new Error(`Error fetching timeline posts: ${error.message}`);
    }
  }


  //Yet to be implemented
  remove(_id: UUID) {
    return `This action removes a #${_id} post`;
  }
}
