import { Controller, Post, Body } from '@nestjs/common';
import { FollowMessage } from 'src/tiktok/interface/follow.interface';
import { NewViewerMessage } from 'src/tiktok/interface/new-viewer.interface';
import { UsersService } from 'src/users/users.service';
import { WebsocketsGateway } from './websockets.gateway';
import { LikeMessage } from 'src/tiktok/interface/like.interface';
import { GameService } from 'src/game/game.service';

@Controller('websockets')
export class WebsocketsController {
    constructor(
        private readonly usersService: UsersService,
        private readonly websocketsService: WebsocketsGateway,
        private readonly gameService: GameService
    ) { }

    @Post('handle-new-viewer')
    async handleNewViewer(
        @Body() data: NewViewerMessage
    ): Promise<void> {
        await this.websocketsService.emitNewViewer(data);
        return await this.usersService.handleNewViewer(data);
    }

    @Post('handle-new-follower')
    async handleNewFollower(
        @Body() data: FollowMessage
    ): Promise<void> {
        return await this.websocketsService.emitFollowReceived(data);
    }

    @Post('handle-like')
    async handleLike(
        @Body() data: LikeMessage
    ): Promise<void> {
        return await this.gameService.handleLikeMessage(data);
    }
}
