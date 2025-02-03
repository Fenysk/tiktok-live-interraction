import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { TiktokModule } from 'src/tiktok/tiktok.module';

@Module({
  imports: [TiktokModule],
  providers: [UsersService],
  exports: [UsersService],  
})
export class UsersModule {}
