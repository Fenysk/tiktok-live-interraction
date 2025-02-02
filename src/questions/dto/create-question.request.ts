import { IsString, IsArray, IsNotEmpty, ArrayMinSize, ValidateNested } from 'class-validator';
import { Type as TransformType, Type } from 'class-transformer';

class OptionRequest {
    @IsString()
    @IsNotEmpty() 
    readonly text: string;
}

export class CreateQuestionRequest {
    @IsString()
    @IsNotEmpty()
    readonly text: string;

    @IsNotEmpty()
    @Type(() => Number)
    readonly correctOptionIndex: number;

    @IsArray()
    @ArrayMinSize(2)
    @ValidateNested({ each: true })
    @TransformType(() => OptionRequest)
    readonly options: OptionRequest[];
}