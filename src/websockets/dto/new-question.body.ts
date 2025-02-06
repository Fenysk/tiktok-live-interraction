import { Question } from '@prisma/client';
import { IsNotEmpty, IsNumber, IsArray } from 'class-validator';

export class NewQuestionBody {

    @IsNumber()
    currentQuestionNumber: number;

    @IsNumber()
    totalQuestions: number;

    @IsNotEmpty()
    newQuestion: Question;

    @IsArray()
    answersOrder: string[];
}