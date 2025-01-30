import { Injectable } from '@nestjs/common';
import { GameState } from './interfaces/game.interface';
import { TiktokService } from 'src/tiktok/tiktok.service';
import { QuestionsService } from 'src/quiz/services/questions.service';
import { WebsocketsGateway } from 'src/websockets/websockets.gateway';
import { StartGameDto } from './dto/start-game.dto';
import { GAME_CONSTANTS } from './constants/game.constants';
import { GameStateService } from './services/game-state.service';
import { GameTimerService } from './services/game-timer.service';

@Injectable()
export class GameService {
    private gameState: GameState;

    private QUESTION_DURATION: number = GAME_CONSTANTS.QUESTION_DURATION;
    private readonly RESTART_DELAY = GAME_CONSTANTS.RESTART_DELAY;
    private totalQuestions: number = GAME_CONSTANTS.TOTAL_QUESTION;
    private currentQuestionNumber: number;
    private isQuestionAnswered: boolean = false;
    private gameQuestions: any[] = [];
    private lastGameSettings: StartGameDto;
    private likeCount: number = 0;
    private readonly LIKES_TO_START = GAME_CONSTANTS.LIKE_COUNT_TO_START;

    constructor(
        private readonly questionsService: QuestionsService,
        private readonly tiktokService: TiktokService,
        private readonly websocketsGateway: WebsocketsGateway,
        private readonly gameStateService: GameStateService,
        private readonly gameTimerService: GameTimerService
    ) {
        this.initializeChatListener();
        this.initializeLikeListener();
        this.gameState = this.gameStateService.getCurrentState();
    }

    private initializeChatListener(): void {
        this.tiktokService.onChatMessage((userId: string, nickname: string, message: string) => {
            if (this.gameState.isActive && this.gameState.currentQuestion) {
                this.handleAnswer(userId, nickname, message);
            }
        });
    }

    private initializeLikeListener(): void {
        this.tiktokService.onLike((userId: string, nickname: string, likeCount: number) => {
            if (!this.gameState.isActive) {
                this.likeCount += likeCount;
                this.websocketsGateway.emitTotalLikes(this.likeCount); 
                
                if (this.likeCount >= this.LIKES_TO_START) {
                    console.log('Starting game due to like threshold reached!');
                    this.likeCount = 0;
                    this.startGame({
                        numberOfQuestions: this.totalQuestions,
                        defaultQuestionTimeout: GAME_CONSTANTS.QUESTION_DURATION
                    });                    
                }
            }
        });
    }

    private startTimer(): void {
        this.gameTimerService.startTimer();
    }

    private stopTimer(): void {
        this.gameTimerService.stopTimer();
    }

    private resetTimer(): void {
        this.gameTimerService.resetTimer();
    }

    async startGame(dto: StartGameDto): Promise<void> {
        if (this.gameState.isActive)
            this.stopGame();

        this.lastGameSettings = dto;
        this.gameState = {
            isActive: true,
            currentQuestion: null,
            scores: new Map<string, number>()
        };

        this.totalQuestions = dto.numberOfQuestions || GAME_CONSTANTS.TOTAL_QUESTION;
        this.currentQuestionNumber = 0;

        if (dto.defaultQuestionTimeout)
            this.QUESTION_DURATION = dto.defaultQuestionTimeout;

        this.gameQuestions = [];
        for (let i = 0; i < this.totalQuestions; i++) {
            const question = await this.questionsService.getRandomQuestion();
            if (!question)
                return this.stopGame();

            this.gameQuestions.push(question);
        }

        await this.nextQuestion();
    }

    stopGame(): void {
        this.gameState.isActive = false;
        this.gameState.currentQuestion = null;
        this.gameState.scores = new Map<string, number>();
        this.stopTimer();
        this.resetTimer();
        this.gameQuestions = [];
        this.currentQuestionNumber = 0;
        this.isQuestionAnswered = false;
        this.websocketsGateway.emitGameEnded(Array.from(this.gameState.scores.entries()));

        setTimeout(async () => {
            console.log('Restarting game...');
            await this.startGame(this.lastGameSettings);
        }, this.RESTART_DELAY);
    }

    async nextQuestion(): Promise<void> {
        if (!this.gameState.isActive) return;

        this.currentQuestionNumber++;

        if (this.currentQuestionNumber > this.totalQuestions) {
            console.log('Game finished! Final scores:');
            console.log(Array.from(this.gameState.scores.entries()));
            return this.stopGame();
        }

        const currentQuestion = this.gameQuestions[this.currentQuestionNumber - 1];

        this.gameState.currentQuestion = {
            id: currentQuestion.id,
            currentQuestionNumber: this.currentQuestionNumber,
            totalQuestions: this.totalQuestions,
            text: currentQuestion.text,
            options: currentQuestion.Options,
            correctOptionId: currentQuestion.correctOptionId
        };

        this.isQuestionAnswered = false;

        console.log(`Question ${this.currentQuestionNumber}/${this.totalQuestions}:`, this.gameState.currentQuestion.text);
        console.log('Options:', this.gameState.currentQuestion.options.map(opt => opt.text));

        this.websocketsGateway.emitNewQuestion(this.gameState.currentQuestion);
        this.startTimer();
    }

    private async handleCorrectAnswer(userId: string, nickname: string): Promise<void> {
        this.stopTimer();
        this.isQuestionAnswered = true;

        const currentScore = this.gameState.scores.get(userId) || 0;
        const newScore = currentScore + 1;
        this.gameState.scores.set(userId, newScore);

        console.log(`${nickname} (${userId}) scored! New score: ${newScore}`);

        this.websocketsGateway.emitCorrectAnswer({
            userId,
            nickname,
            score: newScore
        });
    }

    async handleAnswer(userId: string, nickname: string, answer: string): Promise<boolean> {
        if (!this.gameState.currentQuestion || this.isQuestionAnswered) return false;

        const correctOption = this.gameState.currentQuestion.options.find(
            option => option.id === this.gameState.currentQuestion.correctOptionId
        );

        if (answer.toLowerCase().replace(/[^a-zA-Z0-9]/g, '') === correctOption.text.toLowerCase().replace(/[^a-zA-Z0-9]/g, '')) {
            await this.handleCorrectAnswer(userId, nickname);
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