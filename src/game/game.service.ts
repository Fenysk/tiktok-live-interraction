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
import { TiktokGiftMessage } from 'src/tiktok/interface/gift.interface';
import { Option, Question } from '@prisma/client';
import { GameEventService } from './services/game-event.service';
import { StatisticsService } from 'src/statistics/statistics.service';
import { PlayerBody } from 'src/websockets/dto/player.body';
import { FakeMessages } from 'src/users/fake-messages.constants';
import { UsersService } from 'src/users/users.service';

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
        private readonly usersService: UsersService,
    ) { }

    onModuleInit() {
        this.initializeListeners();
    }


    private initializeListeners(): void {
        this.tiktokService.subscribeToNewMessage(this.handleChatMessage.bind(this));
        this.tiktokService.subscribeToLike(this.handleLikeMessage.bind(this));
        this.tiktokService.subscribeToGift(this.handleGiftMessage.bind(this));
    }

    private handleChatMessage(data: ChatMessage): void {
        const player = this.gameStateService.getPlayer(data.uniqueId);
        if (player && this.gameStateService.getIsGameActive() && this.gameStateService.getCurrentQuestion()) {
            if (player)
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
        // const gameQuestions = await this.fetchFakeQuestions(); // TODO: Remove this fake questions
        if (gameQuestions.length < this.TOTAL_QUESTIONS) {
            return this.stopGame();
        }

        this.gameStateService.setGameQuestions(gameQuestions);
        this.gameStateService.updateGameState({ currentQuestionNumber: 1 });

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

    private async fetchFakeQuestions(): Promise<(Question & { Options: Option[] })[]> {
        const questions: (Question & { Options: Option[] })[] = [];
        for (let i = 0; i < this.TOTAL_QUESTIONS; i++) {
            const question = await this.questionsService.getQuestionAtIndex(i);
            if (!question) {
                break;
            }
            questions.push(question);
        }
        return questions;
    }

    showResults(): void {
        this.handleSendCurrentScores();
        this.gameStateService.setIsActive(false);
        this.gameTimerService.resetTimer();
        this.gameEventService.emitGameEnded();
    }

    stopGame(): void {
        this.gameStateService.resetGameState();
        this.handleSendCurrentScores();
    }

    async nextQuestion(): Promise<void> {
        if (!this.gameStateService.getIsGameActive())
            return;

        this.gameStateService.resetAllResponseTime();

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

        // const fakeUsers = new FakeMessages();

        // this.usersService.handleNewMessage(fakeUsers.exampleChatMessage1);
        // this.usersService.handleNewMessage(fakeUsers.exampleChatMessage2);
        // this.usersService.handleNewMessage(fakeUsers.exampleChatMessage3);
        // this.usersService.handleNewMessage(fakeUsers.exampleChatMessage4);
        // this.usersService.handleNewMessage(fakeUsers.exampleChatMessage5);
        // this.usersService.handleNewMessage(fakeUsers.exampleChatMessage6);
        // this.usersService.handleNewMessage(fakeUsers.exampleChatMessage7);
        // this.usersService.handleNewMessage(fakeUsers.exampleChatMessage8);
        // this.usersService.handleNewMessage(fakeUsers.exampleChatMessage9);
        // this.usersService.handleNewMessage(fakeUsers.exampleChatMessage10);
        // this.usersService.handleNewMessage(fakeUsers.exampleChatMessage11);
        // this.usersService.handleNewMessage(fakeUsers.exampleChatMessage12);
        // this.usersService.handleNewMessage(fakeUsers.exampleChatMessage13);
        // this.usersService.handleNewMessage(fakeUsers.exampleChatMessage14);
        // this.usersService.handleNewMessage(fakeUsers.exampleChatMessage15);
        // this.usersService.handleNewMessage(fakeUsers.exampleChatMessage16);
        // this.usersService.handleNewMessage(fakeUsers.exampleChatMessage17);
        // this.usersService.handleNewMessage(fakeUsers.exampleChatMessage18);

        // setTimeout(() => {
        //     console.log('5 seconds have passed');

        //     setTimeout(() => this.handleChatMessage(fakeUsers.exampleChatMessage1), 1000);
        //     setTimeout(() => this.handleChatMessage(fakeUsers.exampleChatMessage2), 2000);
        //     setTimeout(() => this.handleChatMessage(fakeUsers.exampleChatMessage3), 3000);

        //     setTimeout(() => this.handleChatMessage(fakeUsers.exampleChatMessage4), 1000);
        //     setTimeout(() => this.handleChatMessage(fakeUsers.exampleChatMessage5), 2000);
        //     setTimeout(() => this.handleChatMessage(fakeUsers.exampleChatMessage6), 3000);

        //     setTimeout(() => this.handleChatMessage(fakeUsers.exampleChatMessage7), 1000);
        //     setTimeout(() => this.handleChatMessage(fakeUsers.exampleChatMessage8), 3000);
        //     setTimeout(() => this.handleChatMessage(fakeUsers.exampleChatMessage9), 7000);

        //     setTimeout(() => this.handleChatMessage(fakeUsers.exampleChatMessage10), 1000);
        //     setTimeout(() => this.handleChatMessage(fakeUsers.exampleChatMessage11), 2000);
        //     setTimeout(() => this.handleChatMessage(fakeUsers.exampleChatMessage12), 6000);

        //     setTimeout(() => this.handleChatMessage(fakeUsers.exampleChatMessage13), 6000);
        //     setTimeout(() => this.handleChatMessage(fakeUsers.exampleChatMessage14), 2000);
        //     setTimeout(() => this.handleChatMessage(fakeUsers.exampleChatMessage15), 3000);

        //     setTimeout(() => this.handleChatMessage(fakeUsers.exampleChatMessage16), 3000);
        //     setTimeout(() => this.handleChatMessage(fakeUsers.exampleChatMessage17), 2000);
        //     setTimeout(() => this.handleChatMessage(fakeUsers.exampleChatMessage18), 1000);
        // }, 5000);
    }

    private async handleCorrectAnswer(player: PlayerBody): Promise<void> {
        if (this.gameStateService.checkIfUserAlreadyAnswered(player.uniqueId)) return;

        this.gameStateService.getCurrentQuestion().isAnswered = true;
        this.gameTimerService.startCooldownAndSetFlag();

        this.gameTimerService.setCurrentResponseTime(player.uniqueId);

        this.gameStateService.updateScore(player.uniqueId);
        
        const playerFromOnlineList = this.gameStateService.getPlayer(player.uniqueId);

        if (playerFromOnlineList)
            this.websocketsGateway.emitCorrectAnswer(playerFromOnlineList);

        this.statisticsService.incrementUserCorrectAnswers(playerFromOnlineList.uniqueId);
    }

    private async handleWrongAnswer(player: PlayerBody, answer: string): Promise<void> {
        console.log(`Player ${player.uniqueId} answered incorrectly: ${answer}`);
    }

    async handleAnswer(player: PlayerBody, answer: string): Promise<void> {
        const isPlayerRegisterd = player && this.gameStateService.getPlayer(player.uniqueId);
        if (!isPlayerRegisterd) return;

        const isQuestionReadyToAnwser = this.gameStateService.getCurrentQuestion() && this.gameTimerService.isTimerActive
        if (!isQuestionReadyToAnwser) return;

        this.statisticsService.updateUserLastParticipation(player.uniqueId);

        const correctOption = this.gameStateService.getCurrentQuestion().options.find(
            option => option.id === this.gameStateService.getCurrentQuestion().correctOptionId
        );

        const normalizedAnswer = answer.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-zA-Z0-9]/g, '');
        const normalizedCorrectOption = correctOption.text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-zA-Z0-9]/g, '');

        if (normalizedAnswer === normalizedCorrectOption)
            await this.handleCorrectAnswer(player);
        // else
        //     await this.handleWrongAnswer(player, answer);
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