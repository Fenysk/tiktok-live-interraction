import { Injectable } from '@nestjs/common';
import { GAME_CONSTANTS } from 'src/game/constants/game.constants';

@Injectable()
export class LikeService {
    private likeCount: number = 0;
    private readonly likesToStart: number = GAME_CONSTANTS.LIKE_COUNT_TO_START; // 

    addLikes(count: number): void {
        this.likeCount += count;
    }

    getLikeCount(): number {
        return this.likeCount;
    }

    resetLikeCount(): void {
        this.likeCount = 0;
    }

    shouldStartGame(): boolean {
        return this.likeCount >= this.likesToStart;
    }
}