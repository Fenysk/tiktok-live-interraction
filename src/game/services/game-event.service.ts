import { Injectable } from '@nestjs/common';
import { WebsocketsGateway } from 'src/websockets/websockets.gateway';

@Injectable()
export class GameEventService {
    constructor(
        private readonly websocketsGateway: WebsocketsGateway,
    ) {}

    emitCorrectAnswer(uniqueId: string, nickname: string, profilePictureUrl: string, score: number): void {
        this.websocketsGateway.emitCorrectAnswer({
            uniqueId,
            nickname,
            profilePictureUrl,
            score
        });
    }

    emitNewQuestion(question: any): void {
        this.websocketsGateway.emitNewQuestion(question);
    }

    emitGameEnded(scores: [string, number][]): void {
        this.websocketsGateway.emitGameEnded({scores});
    }
}
