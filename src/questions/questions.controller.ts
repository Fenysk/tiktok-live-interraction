import { Controller, Post, Get, Body, Param, Delete, Query, Put } from '@nestjs/common';
import { CreateQuestionRequest } from 'src/questions/dto/create-question.request';
import { QuestionsService } from './questions.service';
import { FetchQuestionsRequest } from './dto/fetch-questions.request';
import { UpdateQuestionRequest } from './dto/update-question.request';
import { Question } from '@prisma/client';

@Controller('questions')
export class QuestionsController {
    constructor(
        private readonly questionsService: QuestionsService
    ) { }

    @Post()
    async fetchQuestions(
        @Body() dto: FetchQuestionsRequest
    ) {
        return this.questionsService.fetchQuestions(dto);
    }

    @Get('text')
    async getTextOfQuestions() {
        return this.questionsService.getTextOfAllQuestions();
    }

    @Post()
    async createQuestion(@Body() createQuestionDto: CreateQuestionRequest) {
        return this.questionsService.createQuestion(createQuestionDto);
    }

    @Post('multi')
    async createMultipleQuestion(@Body() createQuestionDto: CreateQuestionRequest[]) {
        return this.questionsService.createMultipleQuestion(createQuestionDto);
    }

    @Put()
    async updateQuestion(
        @Body() updateQuestionDto: UpdateQuestionRequest
    ): Promise<Question> {
        return this.questionsService.updateQuestion(updateQuestionDto);
    }

    @Delete(':id')
    async deleteQuestion(@Param('id') id: string) {
      return this.questionsService.deleteQuestion(id);
    }

}
