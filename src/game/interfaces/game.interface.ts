import { Question } from '@prisma/client';
import { TiktokUser } from 'src/tiktok/interface/user.interface';

export interface GameState {
  isActive: boolean;
  gameQuestions: Question[];
  currentQuestion?: Question;
  currentQuestionNumber: number;
  totalQuestions: number;
  scores: Map<string, number>;
  combos: Map<string, number>;
  comboMax: Map<string, number>;
  responseTimes: Map<string, number>;
  onlineUsers: TiktokUser[];
  isAnswered: boolean;
}