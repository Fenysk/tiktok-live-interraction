import { IsString, IsNumber, IsNotEmpty } from 'class-validator';

export class CorrectAnswerBody {
    @IsString()
    @IsNotEmpty()
    uniqueId: string;

    @IsString()
    @IsNotEmpty()
    nickname: string;

    @IsString()
    @IsNotEmpty()
    profilePictureUrl: string;

    @IsNumber()
    score: number;

    @IsNumber()
    combo: number;
  }