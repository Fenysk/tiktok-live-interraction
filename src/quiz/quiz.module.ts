import { Module } from '@nestjs/common';
import { QuizService } from './services/quiz.service';
import { QuestionsService } from './services/questions.service';
import { QuestionsController } from './controllers/questions.controller';
import { TiktokModule } from 'src/tiktok/tiktok.module';
import { QuizController } from './quiz.controller';

@Module({
  imports: [
    TiktokModule
  ],
  providers: [
    QuizService,
    QuestionsService,
  ],
  controllers: [QuestionsController, QuizController],
  exports: [
    QuizService,
    QuestionsService,
  ]
})
export class QuizModule { }
