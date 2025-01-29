export interface GameState {
  isActive: boolean;
  currentQuestion?: {
    correctOptionId: string;
    id: string;
    currentQuestionNumber: number;
    totalQuestions: number;
    text: string;
    options: Array<{
      id: string;
      text: string;
    }>;
  };
  scores: Map<string, number>;
}

