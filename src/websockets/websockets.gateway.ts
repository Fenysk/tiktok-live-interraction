import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

interface Question {
  id: string;
  currentQuestionNumber: number;
  totalQuestions: number;
  text: string;
  options: Array<{
    id: string;
    text: string;
  }>;
  correctOptionId: string;  
}

interface CorrectAnswerData {
  userId: string;
  nickname: string;
  score: number;
}

type Scores = Array<[string, number]>;

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class WebsocketsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private logger = new Logger('WebsocketsGateway');

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  emitNewQuestion(question: Question) {
    this.logger.log(`Emitting new question: ${question.id}`);
    this.server.emit('newQuestion', question);
  }

  emitQuestionTimeout() {
    this.logger.log('Emitting question timeout');
    this.server.emit('questionTimeout');
  }

  emitCorrectAnswer(data: CorrectAnswerData) {
    this.logger.log(`Emitting correct answer: ${data.nickname}`);
    this.server.emit('correctAnswer', data);
  }

  emitGameEnded(scores: Scores) {
    this.logger.log(`Emitting game ended with scores: ${scores}`);
    this.server.emit('gameEnded', scores);
  }
}
