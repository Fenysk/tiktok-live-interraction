import { Injectable } from '@nestjs/common';
import { Statistic } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class StatisticsService {
    constructor(private readonly prismaService: PrismaService) { }

    async updateUserLastParticipation(uniqueId: string): Promise<Statistic> {
        try {
            return await this.prismaService.statistic.upsert({
                where: { uniqueId },
                update: {
                    lastParticipation: new Date(),
                },
                create: {
                    uniqueId,
                    lastParticipation: new Date(),
                }
            });
        } catch (error) {
            console.error(`Failed to update last participation for user ${uniqueId}: ${error.message}`);
        }
    }

    async incrementUserCorrectAnswers(uniqueId: string): Promise<Statistic> {
        try {
            return await this.prismaService.statistic.upsert({
                where: { uniqueId },
                update: {
                    correctAnswers: {
                        increment: 1,
                    },
                },
                create: {
                    uniqueId,
                    correctAnswers: 1,
                }
            });
        } catch (error) {
            console.error(`Failed to increment correct answers for user ${uniqueId}: ${error.message}`);
        }
    }
}
