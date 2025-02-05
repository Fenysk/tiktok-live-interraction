import { IsString, IsNotEmpty, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { PlayerBody } from './player.body';

export class WrongAnswerBody {
  @ValidateNested()
  @Type(() => PlayerBody)
  player: PlayerBody;

  @IsString()
  @IsNotEmpty()
  answer: string;
}
