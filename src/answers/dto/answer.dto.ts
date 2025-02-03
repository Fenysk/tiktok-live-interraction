import { IsString, IsNotEmpty, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { PlayerBody } from 'src/websockets/dto/player.body';

export class AnswerDto {
    @ValidateNested()
    @Type(() => PlayerBody)
    player: PlayerBody;

    @IsString()
    @IsNotEmpty()
    answer: string;
  }