import { Difficulty } from '@prisma/client';
import { IsString, IsArray, IsNotEmpty, ArrayMinSize, IsEnum, IsOptional } from 'class-validator';

export class CreateQuestionRequest {
    @IsString()
    @IsNotEmpty()
    readonly questionText: string;

    @IsArray()
    readonly fieldsToComplete: string[];

    @IsArray()
    @ArrayMinSize(1)
    readonly correctOptions: string[];

    @IsArray()
    @ArrayMinSize(1)
    readonly wrongOptions: string[];

    @IsArray()
    readonly mediasPath: string[];

    @IsOptional()
    @IsString()
    readonly explanation?: string;

    @IsEnum(Difficulty)
    readonly difficulty: Difficulty;
}