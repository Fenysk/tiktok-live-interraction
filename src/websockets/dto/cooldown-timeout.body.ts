import { IsNotEmpty, ValidateNested } from 'class-validator';
import { PlayerBody } from './player.body';
import { Type } from 'class-transformer';

export class CooldownTimeoutBody {
    @IsNotEmpty()
    @ValidateNested({ each: true })
    @Type(() => ResponseTimeBody)
    responseTimes: ResponseTimeBody[];
}

export class ResponseTimeBody {
    @IsNotEmpty()
    @ValidateNested()
    @Type(() => PlayerBody)
    player: PlayerBody;

    @IsNotEmpty()
    time: number;
}