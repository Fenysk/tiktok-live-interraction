import { IsNumber, IsOptional, Min } from 'class-validator';

export class StartGameDto {
  @IsNumber()
  @IsOptional()
  @Min(1)
  numberOfQuestions?: number;

  @IsNumber()
  @IsOptional()
  @Min(1)
  defaultQuestionTimeout?: number;
}
