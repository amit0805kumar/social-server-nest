import { Injectable } from '@nestjs/common';
import { GifDto } from './dto/gif.dto';
import { Gif, GifDocument } from './entities/gif.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UUID } from 'crypto';

@Injectable()
export class GifService {
  constructor(@InjectModel(Gif.name) private gifModel: Model<GifDocument>) {}

  async createGif(gifDto: string[]): Promise<Gif[]> {
    try {
        console.log(gifDto);
        if(!gifDto || gifDto.length === 0) {
            throw new Error('No GIF data provided');
        }
        const gifsToInsert = gifDto.map(code => ({ gifCode: code }));
        console.log('Creating GIFs with data:', gifsToInsert);
      const newGifs = await this.gifModel.insertMany(gifsToInsert, { ordered: false });
      return newGifs;
    } catch (error) {
        console.error('Error creating GIF:', error);
      throw new Error('Error creating GIF');
    }
  }

  async getAllGifs(
    page,
    limit,
  ): Promise<{
    data: Gif[];
    total: number;
    totalPages: number;
    currentPage: number;
  }> {
    try {
      // Ensure page and limit are valid
      const currentPage = Math.max(1, page);
      const pageSize = Math.max(1, limit);
      const skip = (currentPage - 1) * pageSize;
      const [data, total] = await Promise.all([
        this.gifModel.find().skip(skip).limit(pageSize).exec(),
        this.gifModel.countDocuments().exec(),
      ]);
      const totalPages = Math.ceil(total / pageSize);

      return {
        data,
        total,
        totalPages,
        currentPage,
      };
    } catch (error) {
      throw new Error('Error fetching GIFs');
    }
  }

  async deleteGif(gifId: UUID): Promise<any> {
    try {
      if (!gifId) {
        throw new Error('GIF ID is required for deletion');
      }
      const gif = await this.gifModel.findById(gifId).exec();
      if (!gif) {
        throw new Error('GIF not found');
      }
      return await this.gifModel.findByIdAndDelete(gifId).exec();
    } catch (error) {
      throw new Error('Error deleting GIF');
    }
  }
}
