import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { WebsocketsGateway } from "src/websockets/websockets.gateway";
import { GAME_CONSTANTS } from '../constants/game.constants';
import { GameService } from "../game.service";
import { GameStateService } from "./game-state.service";
import { ResponseTimeBody } from "src/websockets/dto/cooldown-timeout.body";

@Injectable()
export class GameTimerService {
    private questionTimeout: NodeJS.Timeout;
    private interval: NodeJS.Timeout;
    private readonly questionDuration = GAME_CONSTANTS.QUESTION_DURATION;
    private readonly cooldownDuration = GAME_CONSTANTS.COOLDOWN_DURATION;
    private remainingTime: number;
    private cooldownTimeout: NodeJS.Timeout;
    isTimerActive: boolean = false;
    isCooldownActive: boolean = false;

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

        this.isTimerActive = true;
        this.questionTimeout = setTimeout(() => this.handleQuestionTimeout(), this.remainingTime);
        this.interval = setInterval(() => this.updateRemainingTime(), 1);
    }

    stopTimer(): void {
        this.isTimerActive = false;
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
        this.remainingTime = this.questionDuration * 1000;
    }

    setCurrentResponseTime(uniqueId: string): void {
        const elapsedTime = this.getElapsedTime();
        this.gameStateService.setResponseTime(uniqueId, elapsedTime);
    }

    getRemainingTime(): number {
        return this.remainingTime;
    }

    getElapsedTime(): number {
        return this.questionDuration * 1000 - this.remainingTime;
    }

    private handleQuestionTimeout(): void {
        this.gameStateService.resetCombosForNotWinners();
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
        this.cooldownTimeout = setTimeout(() => this.handleCooldownEnd(), this.cooldownDuration * 1000);
    }

    private handleCooldownEnd(): void {
        this.isCooldownActive = false;
        this.stopTimer();
        const responseTimes: ResponseTimeBody[] = [];
        this.gameStateService.resetCombosForNotWinners();
        this.gameStateService.getResponseTimes().forEach((time, uniqueId) => {
            const player = this.gameStateService.getPlayer(uniqueId);
            responseTimes.push({ player, time });
        });
        this.websocketsGateway.emitCooldownTimeout({ responseTimes });
        this.gameService.handleSendCurrentScores();
    }

    public startCooldownAndSetFlag(): void {
        if (this.isCooldownActive) return;
        console.log('Premier joueur qui a répondu !')
        this.isCooldownActive = true;
        this.startCooldown();
    }
}