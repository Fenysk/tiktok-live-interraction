import { Injectable } from "@nestjs/common";
import { GameState } from "../interfaces/game.interface";
import { Option, Question } from "@prisma/client";

@Injectable()
export class GameStateService {
    private gameState: GameState;

    constructor() {
        this.resetGameState();
    }

    getCurrentGameState(): GameState {
        return this.gameState;
    }

    updateGameState(newState: Partial<GameState>): void {
        this.gameState = { ...this.gameState, ...newState };
    }

    resetGameState({ isActive = false }: { isActive?: boolean } = {}): void {
        this.gameState = {
            isActive,
            gameQuestions: [],
            currentQuestion: null,
            currentQuestionNumber: 0,
            totalQuestions: 0,
            scores: new Map<string, number>()
        };
    }

    setCurrentQuestion(question: any): void {
        this.gameState.currentQuestion = question;
    }

    setIsActive(isActive: boolean): void {
        this.gameState.isActive = isActive;
    }

    updateScore(userId: string, score: number): number {
        const currentScore = this.gameState.scores.get(userId) || 0;
        const newScore = currentScore + score;
        this.gameState.scores.set(userId, newScore);
        return newScore;
    }

    resetScores(): void {
        this.gameState.scores = new Map<string, number>();
    }

    getScores(): Map<string, number> {
        return this.gameState.scores;
    }

    getIsGameActive(): boolean {
        return this.gameState.isActive;
    }

    getCurrentQuestion(): any {
        return this.gameState.currentQuestion;
    }

    getCurrentQuestionNumber(): number {
        return this.gameState.currentQuestionNumber;
    }

    getGameQuestions(): (Question & { Options: Option[] })[] {
        return this.gameState.gameQuestions;
    }

    setGameQuestions(questions: (Question & { Options: Option[] })[]): void {
        this.gameState.gameQuestions = questions;
    }
}