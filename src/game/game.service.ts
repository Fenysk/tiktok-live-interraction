import { Injectable, OnModuleInit } from '@nestjs/common';
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
import { GiftMessage as TiktokGiftMessage } from 'src/tiktok/interface/gift.interface';
import { Option, Question } from '@prisma/client';
import { GameEventService } from './services/game-event.service';
import { StatisticsService } from 'src/statistics/statistics.service';
import { PlayerBody } from 'src/websockets/dto/player.body';

@Injectable()
export class GameService implements OnModuleInit {
    private TOTAL_QUESTIONS: number = GAME_CONSTANTS.TOTAL_QUESTIONS;
    private QUESTION_DURATION: number = GAME_CONSTANTS.QUESTION_DURATION;

    constructor(
        private readonly websocketsGateway: WebsocketsGateway,
        private readonly questionsService: QuestionsService,
        private readonly tiktokService: TiktokService,
        private readonly gameStateService: GameStateService,
        private readonly gameTimerService: GameTimerService,
        private readonly likeService: LikeService,
        private readonly gameEventService: GameEventService,
        private readonly statisticsService: StatisticsService,
    ) {}

    onModuleInit() {
        this.initializeListeners();
    }

    private initializeListeners(): void {
        this.tiktokService.subscribeToMessage(this.handleChatMessage.bind(this));
        this.tiktokService.subscribeToLike(this.handleLikeMessage.bind(this));
        this.tiktokService.subscribeToGift(this.handleGiftMessage.bind(this));
    }

    private handleChatMessage(data: ChatMessage): void {
        if (this.gameStateService.getIsGameActive() && this.gameStateService.getCurrentQuestion()) {
            const player = this.gameStateService.getPlayer(data.uniqueId);
            this.handleAnswer(player, data.comment);
        }
    }

    handleLikeMessage(newLikeMessage: LikeMessage): void {
        if (!this.gameStateService.getIsGameActive()) {
            const newTotalLikes = this.likeService.addLikesToTotal(newLikeMessage.likeCount);
            this.websocketsGateway.emitTotalLikesFromWaitingRoom({ totalLikes: newTotalLikes });

            if (this.likeService.shouldStartGame()) {
                this.likeService.resetLikeCount();
                this.startGame({
                    numberOfQuestions: this.TOTAL_QUESTIONS,
                    defaultQuestionTimeout: this.QUESTION_DURATION
                });
            }
        }
    }

    private handleGiftMessage(data: TiktokGiftMessage): void {
        this.websocketsGateway.emitGiftReceived({
            uniqueId: data.uniqueId,
            nickname: data.nickname,
            profilePictureUrl: data.profilePictureUrl,
            giftName: data.giftName,
            diamondCount: data.diamondCount
        });
    }

    async startGame(dto: StartGameRequest): Promise<void> {
        if (this.gameStateService.getIsGameActive()) {
            this.stopGame();
        }

        this.gameStateService.resetGameState({ isActive: true });
        this.TOTAL_QUESTIONS = dto.numberOfQuestions || GAME_CONSTANTS.TOTAL_QUESTIONS;

        const gameQuestions = await this.fetchQuestions();
        if (gameQuestions.length < this.TOTAL_QUESTIONS) {
            return this.stopGame();
        }

        this.gameStateService.setGameQuestions(gameQuestions);
        this.gameStateService.updateGameState({ currentQuestionNumber: 1 });

        /// TODO: Supprimer la délimitation
        // this.gameStateService.updateGameState({ currentQuestionNumber: 10 });
        /// Délimitation


        await this.nextQuestion();
    }

    private async fetchQuestions(): Promise<(Question & { Options: Option[] })[]> {
        const questions: (Question & { Options: Option[] })[] = [];
        for (let i = 0; i < this.TOTAL_QUESTIONS; i++) {
            const question = await this.questionsService.getRandomQuestion();
            if (!question) {
                break;
            }
            questions.push(question);
        }
        return questions;
    }

    showResults(): void {
        this.gameStateService.setIsActive(false);
        this.gameTimerService.resetTimer();
        this.gameEventService.emitGameEnded();
        this.handleSendCurrentScores();
    }

    stopGame(): void {
        this.gameStateService.resetGameState();
        this.handleSendCurrentScores();
    }

    async nextQuestion(): Promise<void> {
        if (!this.gameStateService.getIsGameActive())
            return;

        const currentQuestionNumber = this.gameStateService.getCurrentQuestionNumber();

        if (currentQuestionNumber > this.TOTAL_QUESTIONS)
            return this.showResults();

        this.gameStateService.updateGameState({ currentQuestionNumber: currentQuestionNumber + 1 });

        const currentQuestion = this.gameStateService.getGameQuestions()[currentQuestionNumber - 1];

        this.gameStateService.setCurrentQuestion({
            id: currentQuestion.id,
            currentQuestionNumber: currentQuestionNumber,
            totalQuestions: this.TOTAL_QUESTIONS,
            text: currentQuestion.text,
            options: currentQuestion.Options,
            correctOptionId: currentQuestion.correctOptionId
        });

        this.gameEventService.emitNewQuestion(this.gameStateService.getCurrentQuestion());
        this.gameTimerService.startTimer();
    }

    private async handleCorrectAnswer(player: PlayerBody): Promise<void> {
        this.gameTimerService.stopTimer();
        const combo = this.gameStateService.getCombos().get(player.uniqueId) || 0;
        const newScore = this.gameStateService.updateScore(player.uniqueId, 10 * (1 + combo * 0.2));
        const newCombo = this.gameStateService.updatePlayerCurrentCombo(player.uniqueId, 1);
        const comboMax = this.gameStateService.getCombosMax().get(player.uniqueId) || 0;
        this.gameStateService.resetCurrentCombosForOtherUsers(player.uniqueId);
        const updatedPlayer = this.gameStateService.getPlayer(player.uniqueId);

        if (updatedPlayer) {
            this.gameEventService.emitCorrectAnswer({ player: updatedPlayer, score: newScore, combo: newCombo, comboMax });
        }
        this.handleSendCurrentScores();
        this.statisticsService.incrementUserCorrectAnswers(updatedPlayer.uniqueId);
    }

    async handleAnswer(player: PlayerBody, answer: string): Promise<boolean> {
        if (!player) return;

        const isQuestionReadyToAnwser = this.gameStateService.getCurrentQuestion() && !this.gameStateService.getCurrentQuestion().isAnswered
        if (!isQuestionReadyToAnwser) {
            return false;
        }

        this.statisticsService.updateUserLastParticipation(player.uniqueId);

        const correctOption = this.gameStateService.getCurrentQuestion().options.find(
            option => option.id === this.gameStateService.getCurrentQuestion().correctOptionId
        );

        const normalizedAnswer = answer.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-zA-Z0-9]/g, '');
        const normalizedCorrectOption = correctOption.text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-zA-Z0-9]/g, '');

        if (normalizedAnswer === normalizedCorrectOption) {
            await this.handleCorrectAnswer(player);
            return true;
        }

        return false;
    }

    handleSendCurrentScores() {
        const players = this.gameStateService.getOnlineUsers().map(player => ({
            info: {
                uniqueId: player.uniqueId,
                nickname: player.nickname,
                profilePictureUrl: player.profilePictureUrl,
            },
            score: this.gameStateService.getScores().get(player.uniqueId) || 0,
            combo: this.gameStateService.getCombos().get(player.uniqueId) || 0,
            comboMax: this.gameStateService.getCombosMax().get(player.uniqueId) || 0,
        }));

        this.websocketsGateway.emitUpdateCurrentScore({ players });
    }

    getCurrentGameState(): GameState {
        return this.gameStateService.getCurrentGameState();
    }

    isGameStarted(): boolean {
        return this.gameStateService.getIsGameActive();
    }
}