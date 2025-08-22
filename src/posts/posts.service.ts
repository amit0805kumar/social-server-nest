import { Injectable } from '@nestjs/common';
import { PostDto } from './dto/post.dto';
import { Post, PostDocument } from './entities/post.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UUID } from 'crypto';
import { UsersService } from 'src/users/users.service';
import { RedisService } from 'src/common/redis.service';
import { REDIS_KEYS } from 'src/common/constants';

@Injectable()
export class PostsService {
  constructor(
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    private readonly userService: UsersService,
    private readonly redisService: RedisService,
  ) {}

  async create(createPostDto: PostDto): Promise<Post> {
    if (!createPostDto || !createPostDto.userId) {
      throw new Error('User ID is required to create a post');
    }
    try {
      // this.redisService.delCacheByPrefix(
      //   `${REDIS_KEYS.USER_POSTS}:${createPostDto.userId}`,
      // );
      // Clear cache for user posts
      // this.redisService.delCacheByPrefix(REDIS_KEYS.ALL_POSTS);
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
      const posts = await this.postModel
        .find({ userId: _id })
        .sort({ createdAt: -1 })
        .exec();

      return posts;
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

// async findFollowingPosts(followingIds: UUID[]): Promise<Post[]> {
//   if (!followingIds || followingIds.length === 0) {
//     throw new Error('Following IDs are required to fetch following posts');
//   }

//   try {
//     return await this.postModel
//       .find({ userId: { $in: followingIds } })
//       .sort({ createdAt: -1 })
//       .exec();
//   } catch (error) {
//     throw new Error(`Error fetching following posts: ${error.message}`);
//   }
// }

  async findUserPosts(
    _id: UUID,
    skip: number,
    limit: number,
  ): Promise<{ posts: Post[]; total: number }> {
    try {
      if (!_id) {
        throw new Error('User ID is required to fetch user posts');
      }
      if (limit == -1) {
        const temp = await this.postModel
          .find({ userId: _id })
          .sort({ createdAt: -1 })
          .exec();
        return {
          posts: temp,
          total: temp.length,
        };
      }
      const posts = await this.postModel
        .find({ userId: _id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec();

      if (!posts || posts.length === 0) {
        throw new Error(`No posts found for user with id ${_id}`);
      }
      return {
        posts,
        total: posts.length,
      };
    } catch (error) {
      throw new Error(
        `Error fetching user posts with id ${_id}: ${error.message}`,
      );
    }
  }

  async findTimelinePosts(
  _id: UUID,
  page: number,
  limit: number,
): Promise<{
  data: Post[];
  total: number;
  totalPages: number;
  currentPage: number;
}> {
  if (!_id) {
    throw new Error('User ID is required to fetch timeline posts');
  }

  // Ensure page and limit are valid
  const currentPage = Math.max(1, page);
  const pageSize = Math.max(1, limit);

  // Get the user and following IDs
  const user = await this.userService.findOne(_id);
  if (!user) {
    throw new Error('User not found');
  }

  const followingIds = user.following || [];

  // Include the user's own posts in the timeline
  const userAndFollowingIds = [_id, ...followingIds];

  // Prepare query for timeline posts
  const query = { userId: { $in: userAndFollowingIds } };

  // Calculate skip
  const skip = (currentPage - 1) * pageSize;

  // Fetch posts with pagination
  const [posts, total] = await Promise.all([
    this.postModel
      .find(query)
      .sort({ createdAt: -1 }) // Sort by latest first
      .skip(skip)
      .limit(pageSize)
      .lean(), // lean for performance

    this.postModel.countDocuments(query),
  ]);

  return {
    data: posts,
    total,
    totalPages: Math.ceil(total / pageSize),
    currentPage,
  };
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
      // this.redisService.delCacheByPrefix(
      //   `${REDIS_KEYS.USER_POSTS}:${post.userId}`,
      // );
      // this.redisService.delCacheByPrefix(REDIS_KEYS.ALL_POSTS);
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

  async findAllAdminPosts(
    page = 1,
    limit = 10,
  ): Promise<{
    posts: Post[];
    totalPosts: number;
    totalPages: number;
    currentPage: number;
  }> {
    try {
      // ✅ Use dynamic cache key for pagination
      const cacheKey =
        limit === -1
          ? REDIS_KEYS.ALL_POSTS // full list cache
          : `${REDIS_KEYS.ALL_POSTS}_${page}_${limit}`; // paginated cache

      // const cachedPosts = await this.redisService.getCache(cacheKey);
      // if (cachedPosts) {
      //   console.log(`Cache hit for key: ${cacheKey}`);
      //   return JSON.parse(cachedPosts);
      // }

      const adminUserIds = await this.userService.getAllAdminUsers();
      const adminIds = adminUserIds.map((user) => user._id);

      let posts: Post[];
      let totalPosts: number;
      let totalPages: number;

      if (limit === -1) {
        // ✅ Fetch all posts for admins
        posts = await this.postModel
          .find({ userId: { $in: adminIds } })
          .sort({ createdAt: -1 })
          .exec();
        totalPosts = posts.length;
        totalPages = 1;
      } else {
        const skip = (page - 1) * limit;

        [posts, totalPosts] = await Promise.all([
          this.postModel
            .find({ userId: { $in: adminIds } })
            .skip(skip)
            .limit(limit)
            .lean()
            .exec(),
          this.postModel.countDocuments({ userId: { $in: adminIds } }),
        ]);

        totalPages = Math.ceil(totalPosts / limit);
      }

      const response = {
        posts,
        totalPosts,
        totalPages,
        currentPage: page,
      };

      // ✅ Set cache with an expiry
      // await this.redisService.setCache(
      //   cacheKey,
      //   JSON.stringify(response),
      //   3600,
      // );

      return response;
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

    // Delete all cache keys that start with REDIS_KEYS.ALL_POSTS
    // this.redisService.delCacheByPrefix(REDIS_KEYS.ALL_POSTS);
    // this.redisService.delCacheByPrefix(
    //   `${REDIS_KEYS.USER_POSTS}:${posts[0].userId}`,
    // );
    // Clear cache for user posts
    return createdPosts;
  }

  async deletePostByUrl (urls: string[]): Promise<any> {
    try {
      const result = await this.postModel.deleteMany({ url: { $in: urls } });
      return result;
    } catch (error) {
      throw new Error(`Error deleting posts by URL: ${error.message}`);
    }
  }
}
