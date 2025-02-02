import { IsNumber, IsOptional, Min } from 'class-validator';

export class StartGameRequest {
  @IsNumber()
  @IsOptional()
  @Min(1)
  numberOfQuestions?: number;

  @IsNumber()
  @IsOptional()
  @Min(1)
  defaultQuestionTimeout?: number;
}
