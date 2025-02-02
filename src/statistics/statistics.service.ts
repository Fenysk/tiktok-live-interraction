import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class StatisticsService {
    constructor(private readonly prismaService: PrismaService) {}
}
