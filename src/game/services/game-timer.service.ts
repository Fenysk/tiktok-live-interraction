import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { WebsocketsGateway } from "src/websockets/websockets.gateway";
import { GAME_CONSTANTS } from '../constants/game.constants';
import { GameService } from "../game.service";
import { GameStateService } from "./game-state.service";

@Injectable()
export class GameTimerService {
    private questionTimeout: NodeJS.Timeout;
    private readonly questionDuration = GAME_CONSTANTS.QUESTION_DURATION;
    private remainingTime: number;
    private isPaused: boolean = false;

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

        this.isPaused = false;
        this.questionTimeout = setTimeout(async () => {
            this.gameStateService.resetCurrentCombosForOtherUsers();
            this.gameService.handleSendCurrentScores();
            this.websocketsGateway.emitQuestionTimeout();
            this.websocketsGateway.resetCombo();
        }, this.remainingTime);
    }

    stopTimer(): void {
        if (this.questionTimeout) {
            clearTimeout(this.questionTimeout);
            this.questionTimeout = null;
        }
    }

    resetTimer(): void {
        this.stopTimer();
        this.remainingTime = this.questionDuration * 1000;
        this.isPaused = false;
    }
}