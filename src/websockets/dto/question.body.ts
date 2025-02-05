import { Difficulty } from '@prisma/client';
import { IsString, IsNumber, IsArray, IsNotEmpty, ArrayNotEmpty, IsEnum } from 'class-validator';

export class QuestionBody {
    @IsString()
    @IsNotEmpty()
    id: string;

    @IsNumber()
    currentQuestionNumber: number;

    @IsNumber()
    totalQuestions: number;

    @IsString()
    @IsNotEmpty()
    questionText: string;

    @IsArray()
    @ArrayNotEmpty()
    @IsString({ each: true })
    fieldsToComplete: string[];

    @IsArray()
    @ArrayNotEmpty()
    @IsString({ each: true })
    correctOptions: string[];

    @IsArray()
    @ArrayNotEmpty()
    @IsString({ each: true })
    wrongOptions: string[];

    @IsArray()
    @ArrayNotEmpty()
    @IsString({ each: true })
    mediasPath: string[];

    @IsNotEmpty()
    @IsEnum(Difficulty)
    difficulty: Difficulty;

    @IsString()
    @IsNotEmpty()
    explanation: string;
}