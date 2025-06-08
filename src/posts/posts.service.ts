import { Injectable } from '@nestjs/common';
import { PostDto } from './dto/post.dto';
import {Post, PostDocument} from './entities/post.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UUID } from 'crypto';

@Injectable()
export class PostsService {
  constructor(@InjectModel(Post.name) private postModel: Model<PostDocument>) {}
  
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
      return await this.postModel.find({ userId: _id }).exec();
    } catch (error) {
      throw new Error(`Error fetching posts: ${error.message}`);
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

  remove(_id: UUID) {
    return `This action removes a #${_id} post`;
  }
}
