import { Injectable } from '@nestjs/common';
import { CorrectAnswerBody } from 'src/websockets/dto/correct-answer.body';
import { WebsocketsGateway } from 'src/websockets/websockets.gateway';

@Injectable()
export class GameEventService {
    constructor(
        private readonly websocketsGateway: WebsocketsGateway,
    ) {}

    emitCorrectAnswer(correctAnswerBody: CorrectAnswerBody): void {
        this.websocketsGateway.emitCorrectAnswer(correctAnswerBody);
    }

    emitNewQuestion(question: any): void {
        this.websocketsGateway.emitNewQuestion(question);
    }

    emitGameEnded(): void {
        this.websocketsGateway.emitGameEnded();
    }
}
