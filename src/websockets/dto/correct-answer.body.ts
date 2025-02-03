import { IsNumber, IsNotEmpty, ValidateNested } from 'class-validator';
import { PlayerBody } from './player.body';
import { Type } from 'class-transformer';

export class CorrectAnswerBody {
    @IsNotEmpty()
    @ValidateNested()
    @Type(() => PlayerBody)
    player: PlayerBody;

    @IsNumber()
    score: number;

    @IsNumber()
    combo: number;

    @IsNumber()
    comboMax: number;
  }