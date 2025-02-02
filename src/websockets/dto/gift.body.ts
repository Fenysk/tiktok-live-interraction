import { IsString, IsNumber, IsNotEmpty } from 'class-validator';

export class NewGiftBody {
    @IsString()
    @IsNotEmpty()
    uniqueId: string;

    @IsString()
    @IsNotEmpty()
    nickname: string;

    @IsString()
    @IsNotEmpty()
    profilePictureUrl: string;

    @IsString()
    @IsNotEmpty()
    giftName: string;

    @IsNumber()
    diamondCount: number;
  }