import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Req,
  Query,
} from '@nestjs/common';
import { GifService } from './gif.service';
import { GifDto } from './dto/gif.dto';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UUID } from 'crypto';
import {
  createErrorResponse,
  createResponse,
} from 'src/common/helpers/response.helpers';
import { Request } from 'express';

@Controller('gif')
export class GifController {
    constructor(
        private readonly gifService: GifService,
    ) {}

    @Post()
    @UseGuards(JwtAuthGuard)
    async create(@Body() data: {gifCodes: string[]}) {
        try {
            const gif = await this.gifService.createGif(data.gifCodes);
            return createResponse(gif, 'GIF created successfully');
        } catch (error) {
            return createErrorResponse(error);
        }
    }

    @Get('all')
    @UseGuards(JwtAuthGuard)
    async findAll(
        @Query('page') page = 1,
        @Query('limit') limit = 10,
    ) {
        try {
            const gifs = await this.gifService.getAllGifs(page, limit);
            return createResponse(gifs, 'GIFs fetched successfully');
        } catch (error) {
            return createErrorResponse(error);
        }
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    async delete(@Param('id') id: UUID) {
        try {
            await this.gifService.deleteGif(id);
            return createResponse(null, 'GIF deleted successfully');
        } catch (error) {
            return createErrorResponse(error);
        }
    }
}