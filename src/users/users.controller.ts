import { Controller, Post, Body } from '@nestjs/common';
import { UsersService } from './users.service';
import { NewViewerMessage } from 'src/tiktok/interface/new-viewer.interface';

@Controller('users')
export class UsersController {
    constructor(
        private readonly usersService: UsersService
    ) { }

    @Post('handle-new-viewer')
    async handleNewViewer(
        @Body() data: NewViewerMessage
    ): Promise<void> {
        return await this.usersService.handleNewViewer(data);
    }
}
