import { Controller, Post, Body } from '@nestjs/common';
import { AnalyseService } from './analyse.service';
import { ReaskBodyRequest } from './dto/reask-body.request';

@Controller('analyse')
export class AnalyseController {
    constructor(private readonly analyseService: AnalyseService) {}

    @Post('reask')
    async reaskQuestion(
        @Body() reaskBody: ReaskBodyRequest
    ) {
        return this.analyseService.reaskQuestion(reaskBody);
    }
}
