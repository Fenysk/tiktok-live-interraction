import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import { QuestionBody as NewQuestionBody } from './dto/question.body';
import { CorrectAnswerBody } from './dto/correct-answer.body';
import { FinalScoresBody } from './dto/final-scores.body';
import { TotalLikesFromWaitingRoomBody } from './dto/total-likes-from-waiting-room.body';
import { NewGiftBody } from './dto/gift.body';
import { GameStateService } from '../game/services/game-state.service';
import { TiktokService } from 'src/tiktok/tiktok.service';
import { NewFollowerBody } from './dto/new-follower.body';
import { FollowMessage } from 'src/tiktok/interface/follow.interface';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class WebsocketsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private logger = new Logger('WebsocketsGateway');

  constructor(
    private readonly gameStateService: GameStateService,
    private readonly tiktokService: TiktokService
  ) {
    this.initializeListeners();
  }

  private initializeListeners(): void {
    this.tiktokService.setFollowCallback(this.emitFollowReceived.bind(this));
  }

  handleConnection = (client: Socket) => this.logger.log(`Client connected: ${client.id}`);
  handleDisconnect = (client: Socket) => this.logger.log(`Client disconnected: ${client.id}`);

  private emit = (event: string, data: any) => {
    this.logger.log(`Emitting ${event}`);
    this.server.emit(event, data);
  }

  emitNewQuestion = (data: NewQuestionBody) => this.emit('newQuestion', data);
  emitQuestionTimeout = () => {
    this.emit('questionTimeout', null);
    this.resetCombo();
  }
  emitCorrectAnswer = (data: CorrectAnswerBody) => this.emit('correctAnswer', data);
  emitGameEnded = (data: FinalScoresBody) => this.emit('gameEnded', data);
  emitTotalLikesFromWaitingRoom = (data: TotalLikesFromWaitingRoomBody) => this.emit('totalLikes', data);
  emitGiftReceived = (data: NewGiftBody) => this.emit('giftReceived', data);
  
  emitFollowReceived = (data: FollowMessage) => {
    const newFollowerBody: NewFollowerBody = {
      uniqueId: data.uniqueId,
      nickname: data.nickname,
      profilePictureUrl: data.profilePictureUrl
    };
    this.emit('newFollower', newFollowerBody);
  }

  resetCombo(): void {
    this.gameStateService.resetAllCombos();
  }

 
}
