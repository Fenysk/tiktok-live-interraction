import { IsArray, IsNumber, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { PlayerBody } from './player.body';

export class CurrentPlayersScoresBody {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PlayerScoreBody)
  players: PlayerScoreBody[];
}

class PlayerScoreBody {
  @Type(() => PlayerBody)
  @ValidateNested()
  info: PlayerBody;

  @IsNumber()
  score: number;

  @IsNumber()
  combo: number;

  @IsNumber()
  comboMax: number;
}
