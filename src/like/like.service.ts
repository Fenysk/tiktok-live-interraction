import { Injectable } from '@nestjs/common';
import { GAME_CONSTANTS } from 'src/game/constants/game.constants';

@Injectable()
export class LikeService {
    private readonly LIKE_COUNT_TO_START: number = GAME_CONSTANTS.LIKE_COUNT_TO_START;
    private likeCount: number = 0;

    addLikesToTotal(count: number): number {
        this.likeCount += count;
        return this.likeCount;
    }

    resetLikeCount(): void {
        this.likeCount = 0;
    }

    shouldStartGame(): boolean {
        return this.likeCount >= this.LIKE_COUNT_TO_START;
    }
}