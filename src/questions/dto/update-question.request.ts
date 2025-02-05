import { IsString, IsOptional, IsArray, IsEnum } from 'class-validator';
import { Difficulty } from '@prisma/client';

export class UpdateQuestionRequest {
  @IsString()
  id: string;

  @IsString()
  @IsOptional()
  questionText?: string;

  @IsArray()
  @IsOptional()
  fieldsToComplete?: string[];

  @IsArray()
  @IsOptional()
  correctOptions?: string[];

  @IsArray()
  @IsOptional()
  wrongOptions?: string[];

  @IsArray()
  @IsOptional()
  mediasPath?: string[];

  @IsString()
  @IsOptional()
  explanation?: string;

  @IsEnum(Difficulty)
  @IsOptional()
  difficulty?: Difficulty;
}
