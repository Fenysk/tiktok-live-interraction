import { Injectable } from '@nestjs/common';
import { WebsocketsGateway } from 'src/websockets/websockets.gateway';

@Injectable()
export class GameEventService {
    constructor(
        private readonly websocketsGateway: WebsocketsGateway,
    ) {}

    emitNewQuestion(question: any): void {
        this.websocketsGateway.emitNewQuestion(question);
    }

    emitGameEnded(): void {
        this.websocketsGateway.emitGameEnded();
    }
}
