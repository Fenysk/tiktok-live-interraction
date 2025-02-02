import { Controller, Post, Get, Body, Param, Delete } from '@nestjs/common';   
import { CreateQuestionRequest } from 'src/questions/dto/create-question.request';
import { QuestionsService } from './questions.service';

@Controller('questions')
export class QuestionsController {
    constructor(
        private readonly questionsService: QuestionsService
    ) { }

    @Post()
    async createQuestion(@Body() createQuestionDto: CreateQuestionRequest) {
        return this.questionsService.createQuestion(createQuestionDto);
    }

    @Post('multi')
    async createMultipleQuestion(@Body() createQuestionDto: CreateQuestionRequest[]) {
        return this.questionsService.createMultipleQuestion(createQuestionDto);
    }

    @Get()
    async getQuestions() {
        return this.questionsService.getQuestions();
    }

    @Get('text')
    async getTextOfQuestions() {
        return this.questionsService.getTextOfQuestions();
    }

    @Delete(':id')
    async deleteQuestion(@Param('id') id: string) {
      return this.questionsService.deleteQuestion(id);
    }

}
