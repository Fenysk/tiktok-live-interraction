import { Injectable } from "@nestjs/common";
import { GameState } from "../interfaces/game.interface";
import { Option, Question } from "@prisma/client";
import { TiktokUser } from "src/tiktok/interface/user.interface";

@Injectable()
export class GameStateService {
    private gameState: GameState;

    constructor() {
        this.resetGameState();
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
            scores: new Map<string, number>(),
            combos: new Map<string, number>(),
            comboMax: new Map<string, number>(),
            onlineUsers: [],
        };
    }

    updateOnlineUsers(onlineUsers: TiktokUser[]): void {
        this.gameState.onlineUsers = onlineUsers;
        this.initializeScoresForNewUsers(onlineUsers);
    }

    setCurrentQuestion(question: any): void {
        this.gameState.currentQuestion = question;
    }

    setIsActive(isActive: boolean): void {
        this.gameState.isActive = isActive;
    }

    setGameQuestions(questions: (Question & { Options: Option[] })[]): void {
        this.gameState.gameQuestions = questions;
    }

    updateScore(uniqueId: string, score: number): number {
        const currentScore = this.gameState.scores.get(uniqueId) || 0;
        const newScore = currentScore + score;
        this.gameState.scores.set(uniqueId, newScore);
        return newScore;
    }

    updatePlayerCurrentCombo(uniqueId: string, combo: number): number {
        const currentCombo = this.gameState.combos.get(uniqueId) || 0;
        const newCombo = currentCombo + combo;
        this.gameState.combos.set(uniqueId, newCombo);
        const currentComboMax = this.gameState.comboMax.get(uniqueId) || 0;
        if (newCombo > currentComboMax)
            this.gameState.comboMax.set(uniqueId, newCombo);

        return newCombo;
    }

    resetCurrentCombosForOtherUsers(uniqueId?: string): void {
        this.gameState.combos.forEach((_, key) => {
            if (!uniqueId || key !== uniqueId) {
                this.gameState.combos.set(key, 0);
            }
        });
    }

    resetAllCombos(): void {
        this.gameState.combos = new Map<string, number>();
        this.gameState.comboMax = new Map<string, number>();
    }

    private initializeScoresForNewUsers(onlineUsers: TiktokUser[]): void {
        onlineUsers.forEach(user => {
            if (!this.gameState.scores.has(user.uniqueId)) {
                this.gameState.scores.set(user.uniqueId, 0);
            }
        });
    }

    getCurrentGameState(): GameState {
        return this.gameState;
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

    getScores(): Map<string, number> {
        return this.gameState.scores;
    }

    getCombos(): Map<string, number> {
        return this.gameState.combos;
    }

    getCombosMax(): Map<string, number> {
        return this.gameState.comboMax;
    }

    getOnlineUsers(): TiktokUser[] {
        return this.gameState.onlineUsers;
    }

    getPlayer(uniqueId: string): TiktokUser | undefined {
        return this.gameState.onlineUsers.find(user => user.uniqueId === uniqueId);
    }
}