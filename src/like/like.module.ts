import { Module } from '@nestjs/common';
import { LikeService } from './like.service';

@Module({
  providers: [LikeService],
  exports: [LikeService]
})
export class LikeModule {}
