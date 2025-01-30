import { Controller, Delete, Param } from '@nestjs/common';
import { QuestionsService } from './services/questions.service';

@Controller('quiz')
export class QuizController {
  constructor(private readonly questionsService: QuestionsService) {}

  @Delete('delete-question/:id')
  async deleteQuestion(@Param('id') id: string) {
    return this.questionsService.deleteQuestion(id);
  }
}
