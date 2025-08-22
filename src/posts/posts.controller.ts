import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
  Query,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostDto } from './dto/post.dto';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UUID } from 'crypto';
import {
  createErrorResponse,
  createResponse,
} from 'src/common/helpers/response.helpers';
import { UsersService } from 'src/users/users.service';
import { Request } from 'express';

@Controller('posts')
export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly usersService: UsersService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() createPostDto: PostDto) {
    try {
      const post = await this.postsService.create(createPostDto);
      return createResponse(post, 'Post created successfully');
    } catch (error) {
      return createErrorResponse(error.message, 400);
    }
  }

  @Get('all')
  @UseGuards(JwtAuthGuard)
  async findAll(
    @Query('id') id: UUID,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    try {
      const userTimelinePosts = await this.postsService.findTimelinePosts(
        id,
        page,
        limit,
      );
      if (userTimelinePosts && userTimelinePosts.total > 0) {
        return createResponse(
          userTimelinePosts,
          'Following posts fetched successfully',
        );
      }
      return createErrorResponse('Posts not found', 404);
    } catch (error) {
      console.error('Error fetching posts:', error);
      return createErrorResponse(error.message, 400);
    }
  }

  @Get('user')
  @UseGuards(JwtAuthGuard)
  async findUserPosts(
    @Query('id') id: UUID,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    try {
      const posts = await this.postsService.findUserPosts(id, page, limit);
      if (!posts || posts.total === 0) {
        return createErrorResponse('No posts found for this user', 404);
      }
      return createResponse(posts, 'User posts fetched successfully');
    } catch (error) {
      return createErrorResponse(error.message, 400);
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: UUID) {
    try {
      return createResponse(
        await this.postsService.findOne(id),
        'Post fetched successfully',
      );
    } catch (error) {
      return createErrorResponse(error.message, 400);
    }
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  async update(@Param('id') id: UUID, @Body() updatePostDto: PostDto) {
    try {
      if (!updatePostDto || !updatePostDto._id) {
        return createErrorResponse('Post ID is required for update', 400);
      }
      const post = await this.postsService.findOne(updatePostDto._id);
      if (!post) {
        return createErrorResponse(`Post with id ${id} not found`, 404);
      }
      return createResponse(
        await this.postsService.update(id, updatePostDto),
        'Post updated successfully',
      );
    } catch (error) {
      console.log('Error updating post:', error);
      return createErrorResponse(error.message, 400);
    }
  }

  @Delete('by-urls')
  // @UseGuards(JwtAuthGuard)
  async deletePostsByUrls(
    @Body() body: { urls: string[] },
    @Req() req: Request,
  ) {
    try {
      const result = await this.postsService.deletePostByUrl(body.urls);
      return createResponse(result, 'Posts deleted successfully');
    } catch (error) {
      return createErrorResponse(error.message, 400);
    }
  }

  @Delete(':userId')
  @UseGuards(JwtAuthGuard)
  async remove(
    @Param('userId') userId: UUID,
    @Body() postId: { postId: UUID },
  ) {
    console.log('Removing post with ID:', postId, 'for user:', userId);
    try {
      const response = await this.postsService.remove(userId, postId.postId);
      return createResponse(response, 'Post deleted successfully');
    } catch (error) {
      return createErrorResponse(error.message, 400);
    }
  }

  @Patch('like/:id')
  @UseGuards(JwtAuthGuard)
  async likePost(@Param('id') id: UUID, @Req() req: Request) {
    try {
      const userId = (req.user as any).userId;
      console.log(id, req.user);
      const post = await this.postsService.likePost(id, userId);
      return createResponse(post, 'Post liked successfully');
    } catch (error) {
      return createErrorResponse(error.message, 400);
    }
  }

  @Patch('unlike/:id')
  @UseGuards(JwtAuthGuard)
  async unlikePost(@Param('id') id: UUID, @Req() req: Request) {
    try {
      const userId = (req.user as any).userId;
      const post = await this.postsService.unlikePost(id, userId);
      return createResponse(post, 'Post unliked successfully');
    } catch (error) {
      return createErrorResponse(error.message, 400);
    }
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findAllAdminPosts(@Query('page') page = 1, @Query('limit') limit = 10) {
    try {
      const pageNumber = parseInt(page as any, 10);
      const limitNumber = parseInt(limit as any, 10);

      const result = await this.postsService.findAllAdminPosts(
        pageNumber,
        limitNumber,
      );

      if (!result.posts || result.posts.length === 0) {
        return createErrorResponse('No posts found', 404);
      }

      return createResponse(result, 'Paginated posts fetched successfully');
    } catch (error) {
      return createErrorResponse(error.message, 400);
    }
  }

  @Post('multiple')
  @UseGuards(JwtAuthGuard)
  async createMultiplePosts(@Body() createPostDtos: any, @Req() req: Request) {
    try {
      const userId = (req.user as any).userId;
      const username = (req.user as any).username;
      const { imgUrls } = createPostDtos;
      if (!userId || !imgUrls || !Array.isArray(imgUrls)) {
        return createErrorResponse('Invalid input data', 400);
      }
      const currentDate = new Date();
      const postsToInsert = imgUrls.map((imgUrl) => ({
        userId,
        img: imgUrl,
        username,
        createdAt: currentDate,
        updatedAt: currentDate,
        mediaType: imgUrl.toLowerCase().includes('.mp4')
          ? ('video' as const)
          : ('image' as const),
      }));
      const createdPosts =
        await this.postsService.createMultiplePosts(postsToInsert);
      return createResponse(createdPosts, 'Posts created successfully');
    } catch (error) {
      return createErrorResponse(error.message, 400);
    }
  }
}
