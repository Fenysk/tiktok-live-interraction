import { Question, Option } from '@prisma/client';
import { TiktokUser } from 'src/tiktok/interface/user.interface';

export interface GameState {
  isActive: boolean;
  gameQuestions: (Question & { Options: Option[] })[];
  currentQuestion?: Question & { Options: Option[] };
  currentQuestionNumber: number;
  totalQuestions: number;
  scores: Map<string, number>;
  combos: Map<string, number>;
  comboMax: Map<string, number>;
  responseTimes: Map<string, number>;
  onlineUsers: TiktokUser[];
}