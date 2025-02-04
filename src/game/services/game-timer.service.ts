import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { WebsocketsGateway } from "src/websockets/websockets.gateway";
import { GAME_CONSTANTS } from '../constants/game.constants';
import { GameService } from "../game.service";
import { GameStateService } from "./game-state.service";

@Injectable()
export class GameTimerService {
    private questionTimeout: NodeJS.Timeout;
    private interval: NodeJS.Timeout;
    private readonly questionDuration = GAME_CONSTANTS.QUESTION_DURATION;
    private remainingTime: number;
    private isStopTimerAfterGoodAnswerExecuted: boolean = false;
    private isTimerRunning: boolean = false;
    private cooldownTimeout: NodeJS.Timeout;
    private isCooldownActive: boolean = false;

    constructor(
        private readonly websocketsGateway: WebsocketsGateway,
        @Inject(forwardRef(() => GameService))
        private readonly gameService: GameService,
        @Inject(forwardRef(() => GameStateService))
        private readonly gameStateService: GameStateService,
    ) { }

    startTimer(): void {
        this.stopTimer();
        this.resetTimer();

        this.isTimerRunning = true;
        this.questionTimeout = setTimeout(() => this.handleQuestionTimeout(), this.remainingTime);
        this.interval = setInterval(() => this.updateRemainingTime(), 1);
    }

    stopTimer(): void {
        this.isTimerRunning = false;
        if (this.questionTimeout) {
            clearTimeout(this.questionTimeout);
            this.questionTimeout = null;
        }
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
        if (this.cooldownTimeout) {
            clearTimeout(this.cooldownTimeout);
            this.cooldownTimeout = null;
        }
    }

    resetTimer(): void {
        this.stopTimer();
        this.isStopTimerAfterGoodAnswerExecuted = false;
        this.remainingTime = this.questionDuration * 1000;
    }

    setCurrentResponseTime(uniqueId: string): void {
        const elapsedTime = this.getElapsedTime();
        this.gameStateService.setResponseTime(uniqueId, elapsedTime);
        console.log(`Response time for ${uniqueId}: ${elapsedTime} ms`);
    }

    getRemainingTime(): number {
        return this.remainingTime;
    }

    getElapsedTime(): number {
        return this.questionDuration * 1000 - this.remainingTime;
    }

    private handleQuestionTimeout(): void {
        this.gameStateService.resetCurrentCombosForOtherUsers();
        this.gameService.handleSendCurrentScores();
        this.websocketsGateway.emitQuestionTimeout();
        this.websocketsGateway.resetCombo();
        this.stopTimer();
    }

    private updateRemainingTime(): void {
        if (this.remainingTime > 0) {
            this.remainingTime -= 1;
        }
    }

    startCooldown(): void {
        this.cooldownTimeout = setTimeout(() => this.handleCooldownEnd(), 5000);
    }

    private handleCooldownEnd(): void {
        this.isCooldownActive = false;
        this.stopTimer();
        this.gameStateService.getResponseTimes().forEach((time, uniqueId) => {
            console.log(`Final response time for ${uniqueId}: ${time} ms`);
        });
    }

    public startCooldownAndSetFlag(): void {
        if (this.isCooldownActive) return;
        this.isCooldownActive = true;
        this.startCooldown();
    }
}