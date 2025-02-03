import { IsString, IsUrl } from 'class-validator';

export class NewFollowerBody {
  @IsString()
  uniqueId: string;

  @IsString()
  nickname: string;

  @IsUrl()
  profilePictureUrl: string;
}
