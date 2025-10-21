import {UUID} from 'crypto';

export class GifDto {
  gifCode: string; // The code or URL of the GIF
  _id?: UUID; // Optional, for updates or specific GIF retrieval
  createdAt?: Date; // Optional, for tracking when the GIF was created
  updatedAt?: Date; // Optional, for tracking when the GIF was last updated
}