import { Injectable } from "@nestjs/common";
import { GameState } from "../interfaces/game.interface";
import { Option, Question } from "@prisma/client";
import { TiktokUser } from "src/tiktok/interface/user.interface";

@Injectable()
export class GameStateService {
    private currentGameState?: GameState;

    constructor() {
        this.resetGameState();
    }

    updateGameState(newState: Partial<GameState>): void {
        this.currentGameState = { ...this.currentGameState, ...newState };
    }

    resetGameState({ isActive = false }: { isActive?: boolean } = {}): void {
        const onlineUsers = this.getOnlineUsers() || [];
        this.currentGameState = {
            isActive,
            gameQuestions: [],
            currentQuestion: null,
            currentQuestionNumber: 0,
            totalQuestions: 0,
            scores: new Map<string, number>(),
            combos: new Map<string, number>(),
            comboMax: new Map<string, number>(),
            responseTimes: new Map<string, number>(), 
            onlineUsers: onlineUsers,
        };
    }

    updateOnlineUsers(onlineUsers: TiktokUser[]): void {
        this.currentGameState.onlineUsers = onlineUsers;
        this.initializeScoresForNewUsers(onlineUsers);
    }

    setCurrentQuestion(question: any): void {
        this.currentGameState.currentQuestion = question;
    }

    setIsActive(isActive: boolean): void {
        this.currentGameState.isActive = isActive;
    }

    setGameQuestions(questions: (Question & { Options: Option[] })[]): void {
        this.currentGameState.gameQuestions = questions;
    }

    setResponseTime(uniqueId: string, responseTime: number): void {
        this.currentGameState.responseTimes.set(uniqueId, responseTime);
    }

    resetAllResponseTime(): void {
        this.currentGameState.responseTimes = new Map<string, number>();
    }

    updateScore(uniqueId: string): number {
        this.updatePlayerCurrentCombo(uniqueId);
        const currentScore = this.currentGameState.scores.get(uniqueId) || 0;
        const currentPlayerCombo = this.currentGameState.combos.get(uniqueId) || 0;
        const comboMultiplier = 1 + currentPlayerCombo * 0.2;
        const rank = this.getResponseRank(uniqueId);
        const rankMultiplier = 1 + Math.max(1, 10 - rank);
        const newScore = currentScore + 10 * comboMultiplier * rankMultiplier;
        this.currentGameState.scores.set(uniqueId, newScore);        
        return newScore;
    }

    updatePlayerCurrentCombo(uniqueId: string): number {
        const currentCombo = this.currentGameState.combos.get(uniqueId) || 0;
        const newCombo = currentCombo + 1;
        this.currentGameState.combos.set(uniqueId, newCombo);
        const currentComboMax = this.currentGameState.comboMax.get(uniqueId) || 0;
        if (newCombo > currentComboMax)
            this.currentGameState.comboMax.set(uniqueId, newCombo);

        return newCombo;
    }

    resetCombosForNotWinners(): void {
        const winners = Array.from(this.currentGameState.responseTimes.keys());
        console.log(winners.toString());
        this.currentGameState.combos.forEach((_, key) => {
            if (!winners.includes(key)) {
                this.currentGameState.combos.set(key, 0);
            }
        });
    }

    resetAllCombos(): void {
        this.currentGameState.combos = new Map<string, number>();
        this.currentGameState.comboMax = new Map<string, number>();
    }

    private initializeScoresForNewUsers(onlineUsers: TiktokUser[]): void {
        onlineUsers.forEach(user => {
            if (!this.currentGameState.scores.has(user.uniqueId)) {
                this.currentGameState.scores.set(user.uniqueId, 0);
            }
        });
    }

    checkIfUserAlreadyAnswered(uniqueId: string): boolean {
        return this.currentGameState.responseTimes.has(uniqueId);
    }

    getCurrentGameState(): GameState {
        return this.currentGameState;
    }

    getIsGameActive(): boolean {
        return this.currentGameState.isActive;
    }

    getCurrentQuestion(): any {
        return this.currentGameState.currentQuestion;
    }

    getCurrentQuestionNumber(): number {
        return this.currentGameState.currentQuestionNumber;
    }

    getGameQuestions(): (Question & { Options: Option[] })[] {
        return this.currentGameState.gameQuestions;
    }

    getScores(): Map<string, number> {
        return this.currentGameState.scores;
    }

    getCombos(): Map<string, number> {
        return this.currentGameState.combos;
    }

    getCombosMax(): Map<string, number> {
        return this.currentGameState.comboMax;
    }

    getOnlineUsers(): TiktokUser[] {
        return this.currentGameState?.onlineUsers;
    }

    getPlayer(uniqueId: string): TiktokUser | undefined {
        return this.currentGameState.onlineUsers.find(user => user.uniqueId === uniqueId);
    }

    recordResponseTime(uniqueId: string, elapsedTime: number): void {
        this.currentGameState.responseTimes.set(uniqueId, elapsedTime);
    }

    getResponseTimes(): Map<string, number> {
        return this.currentGameState.responseTimes;
    }

    getResponseRank(uniqueId: string): number {
        const responseTimes = Array.from(this.currentGameState.responseTimes.entries());
        responseTimes.sort((a, b) => a[1] - b[1]);
        const rank = responseTimes.findIndex(entry => entry[0] === uniqueId);
        return rank + 1;
    }
}