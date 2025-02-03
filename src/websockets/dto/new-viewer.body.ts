import { IsString, IsUrl } from 'class-validator';

export class NewViewerBody {
  @IsString()
  uniqueId: string;

  @IsString()
  nickname: string;

  @IsUrl()
  profilePictureUrl: string;
}
