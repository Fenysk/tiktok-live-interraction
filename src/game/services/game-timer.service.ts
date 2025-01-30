import { Injectable } from "@nestjs/common";
import { WebsocketsGateway } from "src/websockets/websockets.gateway";
import { GAME_CONSTANTS } from '../constants/game.constants';

@Injectable()
export class GameTimerService {
    private questionTimeout: NodeJS.Timeout;
    private readonly QUESTION_DURATION = GAME_CONSTANTS.QUESTION_DURATION;
    private remainingTime: number;
    private timerStartTime: number;
    private isPaused: boolean = false;

    constructor(private readonly websocketsGateway: WebsocketsGateway) {}

    startTimer(): void {
        this.stopTimer();
        this.resetTimer();

        this.isPaused = false;
        this.timerStartTime = Date.now();
        this.questionTimeout = setTimeout(() => {
            this.websocketsGateway.emitQuestionTimeout();
        }, this.remainingTime);
    }

    stopTimer(): void {
        if (this.questionTimeout) {
            clearTimeout(this.questionTimeout);
            this.questionTimeout = null;
        }
    }

    resetTimer(): void {
        this.remainingTime = this.QUESTION_DURATION;
        this.isPaused = false;
    }
}