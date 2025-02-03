import { IsString, IsUrl } from 'class-validator';

export class PlayerBody {
  @IsString()
  uniqueId: string;

  @IsString()
  nickname: string;

  @IsUrl()
  profilePictureUrl: string;
}
