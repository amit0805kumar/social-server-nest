import {Prop, Schema, SchemaFactory} from '@nestjs/mongoose';
import { UUID } from 'crypto';
import {Document} from 'mongoose';

export type PostDocument = Post & Document;

@Schema({timestamps: true}) // auto handles createdAt and updatedAt
export class Post {

  @Prop()
  desc: string;

  @Prop({required: true})
  userId: UUID; // Reference to User ID

  @Prop({default: []})
  likes?: UUID[]; // Array of User IDs who liked the post

  @Prop({default: []})
  comments?: string[]; // Array of Comment IDs

  @Prop({required: true})
  img: string; // Optional image URL for the post
}

export const PostSchema = SchemaFactory.createForClass(Post);