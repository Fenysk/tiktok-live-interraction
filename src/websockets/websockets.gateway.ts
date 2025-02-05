import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, OnModuleInit } from '@nestjs/common';
import { QuestionBody as NewQuestionBody } from './dto/question.body';
import { TotalLikesFromWaitingRoomBody } from './dto/total-likes-from-waiting-room.body';
import { NewGiftBody } from './dto/gift.body';
import { GameStateService } from '../game/services/game-state.service';
import { TiktokService } from 'src/tiktok/tiktok.service';
import { FollowMessage } from 'src/tiktok/interface/follow.interface';
import { WebSocketEvents } from './enum/websocket-event.enum';
import { NewViewerMessage } from 'src/tiktok/interface/new-viewer.interface';
import { PlayerBody } from './dto/player.body';
import { CurrentPlayersScoresBody } from './dto/current-players-scores.body';
import { CooldownTimeoutBody } from './dto/cooldown-timeout.body';

@WebSocketGateway({ cors: { origin: '*' } })
export class WebsocketsGateway implements OnGatewayConnection, OnGatewayDisconnect, OnModuleInit {
  @WebSocketServer() server: Server;
  private logger = new Logger('WebsocketsGateway');

  constructor(
    private readonly gameStateService: GameStateService,
    private readonly tiktokService: TiktokService
  ) { }

  onModuleInit() {
    this.tiktokService.subscribeToFollow(this.emitFollowReceived.bind(this));
    this.tiktokService.subscribeToNewViewer(this.emitNewViewer.bind(this));
  }

  handleConnection(client: Socket): void {
    this.logger.log(`QuizApp connected: ${client.id}`);
  }

  handleDisconnect(client: Socket): void {
    this.logger.log(`QuizApp disconnected: ${client.id}`);
  }

  private emit(event: WebSocketEvents, data: any): void {
    this.logger.log(`Emitting ${event} with data: ${JSON.stringify(data).substring(0, 20)}.....${JSON.stringify(data).substring(JSON.stringify(data).length - 20)}`);
    this.server.emit(event, data);
  }

  emitNewQuestion(data: NewQuestionBody): void {
    console.log(`New question emitted: ${JSON.stringify(data)}`);
    this.emit(WebSocketEvents.NEW_QUESTION, data);
  }

  emitQuestionTimeout(): void {
    this.emit(WebSocketEvents.QUESTION_TIMEOUT, null);
    this.resetCombo();
  }

  emitCorrectAnswer(data: PlayerBody): void {
    this.emit(WebSocketEvents.CORRECT_ANSWER, data);
  }

  emitGameEnded(): void {
    this.emit(WebSocketEvents.GAME_ENDED, null);
  }

  emitTotalLikesFromWaitingRoom(data: TotalLikesFromWaitingRoomBody): void {
    this.emit(WebSocketEvents.TOTAL_LIKES, data);
  }

  emitGiftReceived(data: NewGiftBody): void {
    this.emit(WebSocketEvents.NEW_GIFT, data);
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
    this.emit(WebSocketEvents.UPDATE_CURRENT_SCORE, data);
  }

  emitCooldownTimeout(data: CooldownTimeoutBody): void {
    this.emit(WebSocketEvents.COOLDOWN_TIMEOUT, data);
  }

  resetCombo(): void {
    this.gameStateService.resetAllCombos();
  }
}
