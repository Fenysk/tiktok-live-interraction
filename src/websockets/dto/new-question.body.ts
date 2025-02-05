import { Question } from '@prisma/client';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class NewQuestionBody {

    @IsNumber()
    currentQuestionNumber: number;

    @IsNumber()
    totalQuestions: number;

    @IsNotEmpty()
    newQuestion: Question;
}