import { Question, Option } from '@prisma/client';

export interface GameState {
  isActive: boolean;
  gameQuestions: (Question & { Options: Option[] })[];
  currentQuestion?: Question & { Options: Option[] };
  currentQuestionNumber: number;
  totalQuestions: number;
  scores: Map<string, number>;
  combos: Map<string, number>;
}