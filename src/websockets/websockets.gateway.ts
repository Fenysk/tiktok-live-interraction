import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, OnModuleInit } from '@nestjs/common';
import { QuestionBody as NewQuestionBody } from './dto/question.body';
import { CorrectAnswerBody } from './dto/correct-answer.body';
import { TotalLikesFromWaitingRoomBody } from './dto/total-likes-from-waiting-room.body';
import { NewGiftBody } from './dto/gift.body';
import { GameStateService } from '../game/services/game-state.service';
import { TiktokService } from 'src/tiktok/tiktok.service';
import { FollowMessage } from 'src/tiktok/interface/follow.interface';
import { WebSocketEvents } from './enum/websocket-event.enum';
import { NewViewerMessage } from 'src/tiktok/interface/new-viewer.interface';
import { PlayerBody } from './dto/player.body';
import { CurrentPlayersScoresBody } from './dto/current-players-scores.body';

@WebSocketGateway({ cors: { origin: '*' } })
export class WebsocketsGateway implements OnGatewayConnection, OnGatewayDisconnect, OnModuleInit {
  @WebSocketServer() server: Server;
  private logger = new Logger('WebsocketsGateway');

  constructor(
    private readonly gameStateService: GameStateService,
    private readonly tiktokService: TiktokService
  ) { }

  onModuleInit() {
    this.tiktokService.subscribeToFollow((data) => {
      this.emitFollowReceived(data);
    });
    this.tiktokService.subscribeToNewViewer((data) => {
      this.emitNewViewer(data);
    });
  }

  handleConnection(client: Socket): void {
    this.logger.log(`QuizApp connected: ${client.id}`);
  }

  handleDisconnect(client: Socket): void {
    this.logger.log(`QuizApp disconnected: ${client.id}`);
  }

  private emit(event: WebSocketEvents, data: any): void {
    this.logger.log(`Emitting ${event}`);
    this.server.emit(event, data);
  }

  emitNewQuestion(data: NewQuestionBody): void {
    this.emit(WebSocketEvents.NEW_QUESTION, data);
  }

  emitQuestionTimeout(): void {
    this.emit(WebSocketEvents.QUESTION_TIMEOUT, null);
    this.resetCombo();
  }

  emitCorrectAnswer(data: CorrectAnswerBody): void {
    this.emit(WebSocketEvents.CORRECT_ANSWER, data);
  }

  emitGameEnded(): void {
    this.emit(WebSocketEvents.GAME_ENDED, null);
  }

  emitTotalLikesFromWaitingRoom(data: TotalLikesFromWaitingRoomBody): void {
    this.emit(WebSocketEvents.TOTAL_LIKES, data);
  }

  emitGiftReceived(data: NewGiftBody): void {
    this.emit(WebSocketEvents.GIFT_RECEIVED, data);
  }

  emitFollowReceived(data: FollowMessage): void {
    const newFollowerBody: PlayerBody = {
      uniqueId: data.uniqueId,
      nickname: data.nickname,
      profilePictureUrl: data.profilePictureUrl,
    };
    this.emit(WebSocketEvents.NEW_FOLLOWER, newFollowerBody);
  }

  emitNewViewer(data: NewViewerMessage): void {
    const newViewerBody: PlayerBody = {
      uniqueId: data.uniqueId,
      nickname: data.nickname,
      profilePictureUrl: data.profilePictureUrl,
    };
    this.emit(WebSocketEvents.NEW_VIEWER, newViewerBody);
  }

  emitUpdateCurrentScore(data: CurrentPlayersScoresBody): void {
    this.logger.log(`Emitting ${WebSocketEvents.UPDATE_CURRENT_SCORE} with data: ${JSON.stringify(data)}`);
    this.emit(WebSocketEvents.UPDATE_CURRENT_SCORE, data);
  }

  resetCombo(): void {
    this.gameStateService.resetAllCombos();
  }
}
