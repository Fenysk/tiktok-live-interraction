import { IsString, IsOptional, IsBoolean, IsInt, Min } from 'class-validator';

export class FetchQuestionsRequest {
  @IsString()
  @IsOptional()
  query?: string;

  @IsBoolean()
  @IsOptional()
  findInAnswers?: boolean;

  @IsBoolean()
  @IsOptional()
  findInQuestion?: boolean;

  @IsBoolean()
  @IsOptional()
  findInFieldsToComplete?: boolean;

  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number;
}
