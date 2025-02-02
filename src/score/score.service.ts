import { Injectable } from '@nestjs/common';

@Injectable()
export class ScoreService {
    private scores: Map<string, number> = new Map();

    updateScore(userId: string, increment: number): void {
        const currentScore = this.scores.get(userId) || 0;
        this.scores.set(userId, currentScore + increment);
    }

    getScores(): Map<string, number> {
        return this.scores;
    }

    resetScores(): void {
        this.scores = new Map();
    }
}
