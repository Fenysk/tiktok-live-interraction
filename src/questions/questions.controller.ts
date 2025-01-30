import { Controller, Post, Get, Body, Param, Delete } from '@nestjs/common';   
import { CreateQuestionDto } from 'src/questions/dto/create-question.dto';
import { QuestionsService } from './questions.service';

@Controller('questions')
export class QuestionsController {
    constructor(
        private readonly questionsService: QuestionsService
    ) { }

    @Post()
    async createQuestion(@Body() createQuestionDto: CreateQuestionDto) {
        return this.questionsService.createQuestion(createQuestionDto);
    }

    @Get()
    async getQuestions() {
        return this.questionsService.getQuestions();
    }

    @Delete(':id')
    async deleteQuestion(@Param('id') id: string) {
      return this.questionsService.deleteQuestion(id);
    }

}
