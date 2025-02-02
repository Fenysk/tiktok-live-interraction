import { Injectable } from '@nestjs/common';
import { GameState } from './interfaces/game.interface';
import { TiktokService } from 'src/tiktok/tiktok.service';
import { QuestionsService } from 'src/questions/questions.service';
import { WebsocketsGateway } from 'src/websockets/websockets.gateway';
import { StartGameRequest } from './dto/start-game.request';
import { GAME_CONSTANTS } from './constants/game.constants';
import { GameStateService } from './services/game-state.service';
import { GameTimerService } from './services/game-timer.service';
import { LikeService } from 'src/like/like.service';
import { ChatMessage } from 'src/tiktok/interface/chat.interface';
import { LikeMessage } from 'src/tiktok/interface/like.interface';
import { GiftMessage } from 'src/tiktok/interface/gift.interface';
import { Option, Question } from '@prisma/client';
import { ScoreService } from 'src/score/score.service';
import { GameEventService } from './services/game-event.service';

@Injectable()
export class GameService {
    private TOTAL_QUESTIONS: number = GAME_CONSTANTS.TOTAL_QUESTIONS;
    private gameState: GameState;
    private currentQuestionNumber: number;
    private isCurrentQuestionAnswered: boolean = false;
    private gameQuestions: (Question & { Options: Option[] })[] = [];

    constructor(
        private readonly questionsService: QuestionsService,
        private readonly tiktokService: TiktokService,
        private readonly websocketsGateway: WebsocketsGateway,
        private readonly gameStateService: GameStateService,
        private readonly gameTimerService: GameTimerService,
        private readonly likeService: LikeService,
        private readonly scoreService: ScoreService,
        private readonly gameEventService: GameEventService
    ) {
        this.initializeListeners();
        this.gameState = this.gameStateService.getCurrentState();
    }

    private initializeListeners(): void {
        this.tiktokService.setMessageCallback(this.handleChatMessage.bind(this));
        this.tiktokService.setLikeCallback(this.handleLikeMessage.bind(this));
        this.tiktokService.setGiftCallback(this.handleGiftMessage.bind(this));
    }

    private handleChatMessage(data: ChatMessage): void {
        if (this.gameState.isActive && this.gameState.currentQuestion) {
            this.handleAnswer(data.userId, data.nickname, data.profilePictureUrl, data.comment);
        }
    }

    private handleLikeMessage(data: LikeMessage): void {
        if (!this.gameState.isActive) {
            this.likeService.addLikes(data.likeCount);
            const totalLikes = this.likeService.getLikeCount();
            this.websocketsGateway.emitTotalLikes(totalLikes);

            if (this.likeService.shouldStartGame()) {
                this.likeService.resetLikeCount();
                this.startGame({
                    numberOfQuestions: this.TOTAL_QUESTIONS,
                    defaultQuestionTimeout: GAME_CONSTANTS.QUESTION_DURATION
                });
            }
        }
    }

    private handleGiftMessage(data: GiftMessage): void {
        this.websocketsGateway.emitGiftReceived({
            userId: data.userId,
            nickname: data.nickname,
            profilePictureUrl: data.profilePictureUrl,
            giftName: data.giftName,
            diamondCount: data.diamondCount
        });
    }

    async startGame(dto: StartGameRequest): Promise<void> {
        if (this.gameState.isActive) this.stopGame();

        this.initializeGameState();
        this.TOTAL_QUESTIONS = dto.numberOfQuestions || GAME_CONSTANTS.TOTAL_QUESTIONS;
        this.currentQuestionNumber = 0;

        this.gameQuestions = await this.fetchQuestions();
        if (this.gameQuestions.length < this.TOTAL_QUESTIONS) return this.stopGame();

        await this.nextQuestion();
    }

    private initializeGameState(): void {
        this.gameState = {
            isActive: true,
            currentQuestion: null,
            scores: new Map<string, number>()
        };
    }

    private async fetchQuestions(): Promise<(Question & { Options: Option[] })[]> {
        const questions: (Question & { Options: Option[] })[] = [];
        for (let i = 0; i < this.TOTAL_QUESTIONS; i++) {
            const question = await this.questionsService.getRandomQuestion();
            if (!question) break;
            questions.push(question);
        }
        return questions;
    }

    stopGame(): void {
        this.gameState.isActive = false;
        this.gameState.currentQuestion = null;
        this.scoreService.resetScores();
        this.gameTimerService.stopTimer();
        this.gameTimerService.resetTimer();
        this.gameQuestions = [];
        this.currentQuestionNumber = 0;
        this.isCurrentQuestionAnswered = false;
        this.gameEventService.emitGameEnded(Array.from(this.scoreService.getScores().entries()));
    }

    async nextQuestion(): Promise<void> {
        if (!this.gameState.isActive) return;

        this.currentQuestionNumber++;

        if (this.currentQuestionNumber > this.TOTAL_QUESTIONS) {
            return this.stopGame();
        }

        const currentQuestion = this.gameQuestions[this.currentQuestionNumber - 1];

        this.gameState.currentQuestion = {
            id: currentQuestion.id,
            currentQuestionNumber: this.currentQuestionNumber,
            totalQuestions: this.TOTAL_QUESTIONS,
            text: currentQuestion.text,
            options: currentQuestion.Options,
            correctOptionId: currentQuestion.correctOptionId
        };

        this.isCurrentQuestionAnswered = false;

        this.gameEventService.emitNewQuestion(this.gameState.currentQuestion);
        this.gameTimerService.startTimer();
    }

    private async handleCorrectAnswer(userId: string, nickname: string, profilePictureUrl: string): Promise<void> {
        this.gameTimerService.stopTimer();
        this.isCurrentQuestionAnswered = true;

        this.scoreService.updateScore(userId, 1);

        this.gameEventService.emitCorrectAnswer(userId, nickname, profilePictureUrl);
    }

    async handleAnswer(userId: string, nickname: string, profilePictureUrl: string, answer: string): Promise<boolean> {
        if (!this.gameState.currentQuestion || this.isCurrentQuestionAnswered) return false;

        const correctOption = this.gameState.currentQuestion.options.find(
            option => option.id === this.gameState.currentQuestion.correctOptionId
        );

        const normalizedAnswer = answer.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-zA-Z0-9]/g, '');
        const normalizedCorrectOption = correctOption.text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-zA-Z0-9]/g, '');

        if (normalizedAnswer === normalizedCorrectOption) {
            await this.handleCorrectAnswer(userId, nickname, profilePictureUrl);
            return true;
        }

        return false;
    }

    getCurrentState(): GameState {
        return this.gameState;
    }

    isGameStarted(): boolean {
        return this.gameState.isActive;
    }
}
