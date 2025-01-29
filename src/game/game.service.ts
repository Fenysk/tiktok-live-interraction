import { Injectable } from '@nestjs/common';
import { GameState } from './interfaces/game.interface';
import { TiktokService } from 'src/tiktok/tiktok.service';
import { QuestionsService } from 'src/quiz/services/questions.service';
import { WebsocketsGateway } from 'src/websockets/websockets.gateway';

@Injectable()
export class GameService {
    private gameState: GameState = {
        isActive: false,
        currentQuestion: null,
        scores: new Map<string, number>()
    };

    private questionTimeout: NodeJS.Timeout;
    private readonly QUESTION_DURATION = 30000;

    constructor(
        private readonly questionsService: QuestionsService,
        private readonly tiktokService: TiktokService,
        private readonly websocketsGateway: WebsocketsGateway
    ) {
        this.initializeChatListener();
    }

    private initializeChatListener(): void {
        this.tiktokService.onChatMessage((userId: string, nickname: string, message: string) => {
            if (this.gameState.isActive && this.gameState.currentQuestion) {
                this.handleAnswer(userId, nickname, message);
            }
        });
    }

    async startGame(): Promise<void> {
        this.gameState.isActive = true;
        this.gameState.scores = new Map();
        await this.nextQuestion();
    }

    stopGame(): void {
        this.gameState.isActive = false;
        clearTimeout(this.questionTimeout);
        this.websocketsGateway.emitGameEnded(Array.from(this.gameState.scores.entries()));
    }

    private async nextQuestion(): Promise<void> {
        if (!this.gameState.isActive) return;

        const randomQuestion = await this.questionsService.getRandomQuestion();
        if (!randomQuestion)
            return this.stopGame();

        this.gameState.currentQuestion = {
            id: randomQuestion.id,
            text: randomQuestion.text,
            options: randomQuestion.Options,
            correctOptionId: randomQuestion.correctOptionId
        };

        console.log('Question:', this.gameState.currentQuestion.text);
        console.log('Options:', this.gameState.currentQuestion.options.map(opt => opt.text));

        this.websocketsGateway.emitNewQuestion(this.gameState.currentQuestion);

        this.questionTimeout = setTimeout(() => {
            this.websocketsGateway.emitQuestionTimeout();
            this.nextQuestion();
        }, this.QUESTION_DURATION);
    }

    private async handleCorrectAnswer(userId: string, nickname: string): Promise<void> {
        clearTimeout(this.questionTimeout);

        const currentScore = this.gameState.scores.get(userId) || 0;
        const newScore = currentScore + 1;
        this.gameState.scores.set(userId, newScore);

        console.log(`${nickname} (${userId}) scored! New score: ${newScore}`);

        this.websocketsGateway.emitCorrectAnswer({
            userId,
            nickname,
            score: newScore
        });

        await this.nextQuestion();
    }

    async handleAnswer(userId: string, nickname: string, answer: string): Promise<boolean> {
        if (!this.gameState.currentQuestion) return false;

        const correctOption = this.gameState.currentQuestion.options.find(
            option => option.id === this.gameState.currentQuestion.correctOptionId
        );

        if (answer.toLowerCase() === correctOption.text.toLowerCase()) {
            await this.handleCorrectAnswer(userId, nickname);
            return true;
        }

        return false;
    }

    getCurrentState(): GameState {
        return this.gameState;
    }
}