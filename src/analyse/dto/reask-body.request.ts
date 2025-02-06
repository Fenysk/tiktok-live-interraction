import { IsNotEmpty, IsBoolean, IsOptional, IsString } from 'class-validator';
import { Question } from '@prisma/client';

export class ReaskBodyRequest {
    @IsNotEmpty()
    question: Question;

    @IsString()
    @IsOptional()
    prompt?: string;

    @IsBoolean()
    shouldReaskQuestion: boolean;

    @IsBoolean()
    shouldReaskAnswers: boolean;

    @IsBoolean()
    shouldReaskExplanation: boolean;

    @IsBoolean()
    shouldReaskFieldsToComplete: boolean;
}
