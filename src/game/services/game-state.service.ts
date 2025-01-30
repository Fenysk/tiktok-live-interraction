import { Injectable } from "@nestjs/common";
import { GameState } from "../interfaces/game.interface";

@Injectable()
export class GameStateService {
    private gameState: GameState = {
        isActive: false,
        currentQuestion: null,
        scores: new Map<string, number>()
    };

    getCurrentState(): GameState {
        return this.gameState;
    }

    updateState(newState: Partial<GameState>): void {
        this.gameState = { ...this.gameState, ...newState };
    }

    resetState(): void {
        this.gameState = {
            isActive: false,
            currentQuestion: null,
            scores: new Map<string, number>()
        };
    }
}