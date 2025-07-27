import { UUID } from 'crypto';

export class PostDto {
  userId: UUID; // Assuming userId is a UUID
  img: string; // Optional image URL for the post
  desc?: string; // Optional description for the post
  likes?: UUID[]; // Array of User IDs who liked the post
  comments?: string[]; // Array of Comment IDs
  _id?: UUID; // Optional, for updates or specific post retrieval
  userName?: string; // Optional username for the post
  profilePicture?: string; // Optional profile picture URL for the user
  createdAt?: Date; // Optional, for tracking when the post was created
  updatedAt?: Date; // Optional, for tracking when the post was last updated
  mediaType: 'image' | 'video'; // Optional, to specify the type of media
}
