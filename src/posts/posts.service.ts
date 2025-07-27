import { Injectable } from '@nestjs/common';
import { PostDto } from './dto/post.dto';
import { Post, PostDocument } from './entities/post.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UUID } from 'crypto';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    private readonly userService: UsersService,
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
      return await this.postModel
        .find({ userId: _id })
        .sort({ createdAt: -1 })
        .exec();
    } catch (error) {
      throw new Error(`Error fetching posts: ${error.message}`);
    }
  }

  async findUserPosts(_id: UUID): Promise<Post[]> {
    try {
      if (!_id) {
        throw new Error('User ID is required to fetch user posts');
      }
      const posts = await this.postModel
        .find({ userId: _id })
        .sort({ createdAt: -1 })
        .exec();
      if (!posts || posts.length === 0) {
        throw new Error(`No posts found for user with id ${_id}`);
      }
      return posts;
    } catch (error) {
      throw new Error(
        `Error fetching user posts with id ${_id}: ${error.message}`,
      );
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

  async update(userId: UUID, updatePostDto: PostDto): Promise<Post> {
    if (!userId || !updatePostDto || !updatePostDto._id) {
      throw new Error('Post ID and update data are required to update a post');
    }
    if (!updatePostDto.userId) {
      throw new Error('User ID is required to update a post');
    }
    if (updatePostDto.userId !== userId) {
      throw new Error('User ID mismatch: You can only update your own posts');
    }
    try {
      const updatedPost = await this.postModel
        .findByIdAndUpdate(updatePostDto._id, updatePostDto, {
          new: true,
          runValidators: true,
        })
        .exec();
      if (!updatedPost) {
        throw new Error(`Post with id ${updatePostDto._id} not found`);
      }
      return updatedPost;
    } catch (error) {
      throw new Error(
        `Error updating post with id ${updatePostDto._id}: ${error.message}`,
      );
    }
  }

  async findFollowingPosts(followingIds: UUID[]): Promise<Post[]> {
    if (!followingIds || followingIds.length === 0) {
      throw new Error('Following IDs are required to fetch following posts');
    }
    try {
      return await this.postModel
        .find({ userId: { $in: followingIds } })
        .sort({ createdAt: -1 })
        .exec();
    } catch (error) {
      throw new Error(`Error fetching following posts: ${error.message}`);
    }
  }

  async findTimelinePosts(_id: UUID): Promise<Post[]> {
    try {
      const posts = await this.findAll(_id);
      const user = await this.userService.findOne(_id);

      if (user.following && user.following.length > 0) {
        const followingPosts = await this.findFollowingPosts(user.following);
        return [...posts, ...followingPosts].sort(
          (a, b) => b?.createdAt?.getTime() - a?.createdAt?.getTime(),
        );
      }
      return posts;
    } catch (error) {
      throw new Error(`Error fetching timeline posts: ${error.message}`);
    }
  }

  //Yet to be implemented
  async remove(_id: UUID, postId: UUID): Promise<Post> {
    try {
      if (!_id || !postId) {
        throw new Error('User ID and Post ID are required to remove a post');
      }
      const post = await this.postModel.findById(postId).exec();
      if (!post || post.userId !== _id) {
        throw new Error('User ID mismatch: You can only remove your own posts');
      }
      const response = await this.postModel.findByIdAndDelete(postId).exec();
      if (!response) {
        throw new Error(`Post with id ${postId} not found`);
      }
      return response;
    } catch (error) {
      throw new Error(`Error removing post with id ${_id}: ${error.message}`);
    }
  }

  async likePost(postId: UUID, userId: UUID): Promise<Post> {
    try {
      if (!postId || !userId) {
        throw new Error('Post ID and User ID are required to like a post');
      }
      const post = await this.postModel.findById(postId).exec();
      if (!post) {
        throw new Error(`Post with id ${postId} not found`);
      }
      if (post.likes && post.likes.includes(userId)) {
        throw new Error(
          `User with id ${userId} has already liked the post with id ${postId}`,
        );
      }
      post.likes?.push(userId) || (post.likes = [userId]);
      post.updatedAt = new Date(); // Update the timestamp
      await post.save();
      return post;
    } catch (error) {
      throw new Error(`Error liking post with id ${postId}: ${error.message}`);
    }
  }

  async unlikePost(postId: UUID, userId: UUID): Promise<Post> {
    try {
      if (!postId || !userId) {
        throw new Error('Post ID and User ID are required to like a post');
      }
      const post = await this.postModel.findById(postId).exec();
      if (!post) {
        throw new Error(`Post with id ${postId} not found`);
      }
      if (post.likes && post.likes.includes(userId)) {
        post.likes = post.likes.filter((id) => id !== userId);
      } else {
        throw new Error(
          `User with id ${userId} has not liked the post with id ${postId}`,
        );
      }
      post.updatedAt = new Date(); // Update the timestamp
      if (post.likes.length === 0) {
        post.likes = []; // Ensure likes is an empty array if no likes left
      }
      // Save the updated post
      await post.save();
      return post;
    } catch (error) {
      throw new Error(
        `Error unliking post with id ${postId}: ${error.message}`,
      );
    }
  }

  async findAllPosts(
    page = 1,
    limit = 10,
  ): Promise<{
    posts: Post[];
    totalPosts: number;
    totalPages: number;
    currentPage: number;
  }> {
    try {
      if (limit === -1) {
        const posts = await this.postModel
          .find()
          .sort({ createdAt: -1 })
          .exec();
        const totalPosts = posts.length;

        return {
          posts,
          totalPosts,
          totalPages: 1,
          currentPage: 1,
        };
      }

      const skip = (page - 1) * limit;

      const [posts, totalPosts] = await Promise.all([
        this.postModel
          .find()
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .exec(),
        this.postModel.countDocuments(),
      ]);

      const totalPages = Math.ceil(totalPosts / limit);

      return {
        posts,
        totalPosts,
        totalPages,
        currentPage: page,
      };
    } catch (error) {
      throw new Error(`Error fetching paginated posts: ${error.message}`);
    }
  }

   async createMultiplePosts(posts: PostDto[]): Promise<Post[]> {
    if (!posts || posts.length === 0) {
      throw new Error('At least one post is required to create multiple posts');
    }

    // Validate userId for each post
    for (const post of posts) {
      if (!post.userId) {
        throw new Error('User ID is required for each post');
      }
    }

    // Add timestamps to each post
    const currentDate = new Date();
    const postsToInsert = posts.map((post) => ({
      ...post,
      createdAt: currentDate,
      updatedAt: currentDate,
    }));

    // Insert posts into the database
    const createdPosts = await this.postModel.insertMany(postsToInsert);

    return createdPosts;
  }

}
