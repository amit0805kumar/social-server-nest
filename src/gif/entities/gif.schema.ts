import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type GifDocument = Gif & Document;

@Schema({ timestamps: true }) // auto handles createdAt and updatedAt
export class Gif {

  @Prop({ required: true, unique: true })
  gifCode: string; // The code or URL of the GIF

  @Prop({ default: Date.now })
  createdAt: Date; // Optional creation date for the post

  @Prop({ default: Date.now })
  updatedAt: Date; // Optional update date for the post
}

export const GifSchema = SchemaFactory.createForClass(Gif);
