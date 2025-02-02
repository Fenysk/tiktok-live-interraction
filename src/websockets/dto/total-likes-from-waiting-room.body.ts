import { IsNumber } from "class-validator";

export class TotalLikesFromWaitingRoomBody {
    @IsNumber()
    totalLikes: number;
}

