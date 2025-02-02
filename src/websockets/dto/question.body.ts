import { IsString, IsNumber, IsArray, ValidateNested, IsNotEmpty, ArrayNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

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
    text: string;

    @IsArray()
    @ArrayNotEmpty()
    @ValidateNested({ each: true })
    @Type(() => OptionBody)
    options: OptionBody[];

    @IsString()
    @IsNotEmpty()
    correctOptionId: string;
}

class OptionBody {
    @IsString()
    @IsNotEmpty()
    id: string;

    @IsString()
    @IsNotEmpty()
    text: string;
}