import { IsBoolean, IsString, IsOptional } from 'class-validator';

export class BaseResponseDto {
    @IsBoolean()
    success: boolean;

    @IsOptional()
    @IsString()
    message?: string;

    @IsOptional()
    data?: any;
}