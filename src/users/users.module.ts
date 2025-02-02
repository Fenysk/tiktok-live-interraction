import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { TiktokModule } from 'src/tiktok/tiktok.module';
import { UsersController } from './users.controller';

@Module({
  imports: [TiktokModule],
  providers: [UsersService],
  controllers: [UsersController]
})
export class UsersModule {}
