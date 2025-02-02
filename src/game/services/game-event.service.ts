import { Injectable } from '@nestjs/common';
import { ScoreService } from 'src/score/score.service';
import { WebsocketsGateway } from 'src/websockets/websockets.gateway';

@Injectable()
export class GameEventService {
    constructor(
        private readonly websocketsGateway: WebsocketsGateway,
        private readonly scoreManagerService: ScoreService
    ) {}

    emitCorrectAnswer(userId: string, nickname: string, profilePictureUrl: string): void {
        const score = this.scoreManagerService.getScores().get(userId) || 0;
        this.websocketsGateway.emitCorrectAnswer({
            userId,
            nickname,
            profilePictureUrl,
            score
        });
    }

    emitNewQuestion(question: any): void {
        this.websocketsGateway.emitNewQuestion(question);
    }

    emitGameEnded(scores: [string, number][]): void {
        this.websocketsGateway.emitGameEnded(scores);
    }
}
