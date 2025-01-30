import { IsString, IsNotEmpty } from 'class-validator';

export class AnswerDto {
    @IsString()
    @IsNotEmpty()
    userId: string;

    @IsString()
    @IsNotEmpty()
    nickname: string;

    @IsString()
    @IsNotEmpty()
    answer: string;
  }