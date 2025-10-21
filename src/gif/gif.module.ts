import { Module } from "@nestjs/common";
import { Gif, GifSchema } from "./entities/gif.schema";
import {GifController} from "./gif.controller";
import {GifService} from "./gif.service";
import {MongooseModule} from "@nestjs/mongoose";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Gif.name, schema: GifSchema }]),
  ],
  controllers: [GifController],
  providers: [GifService],
})
export class GifModule {}
