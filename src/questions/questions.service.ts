import { Injectable } from '@nestjs/common';
import { CreateQuestionRequest } from './dto/create-question.request';
import { PrismaService } from 'src/prisma/prisma.service';
import { Question } from '@prisma/client';

@Injectable()
export class QuestionsService {
    constructor(
        private readonly prismaService: PrismaService,
    ) { }

    async createQuestion(createQuestionDto: CreateQuestionRequest) {
        const createdQuestion = await this.prismaService.question.create({
            data: createQuestionDto,
        });

        return createdQuestion;
    }

    async createMultipleQuestion(createQuestionDto: CreateQuestionRequest[]) {
        return this.prismaService.$transaction(async (tx) => {
            const createdQuestions = await Promise.all(
                createQuestionDto.map(async (questionDto) => {
                    const question = await tx.question.create({
                        data: {
                            questionText: questionDto.questionText,
                            fieldsToComplete: questionDto.fieldsToComplete,
                            correctOptions: questionDto.correctOptions,
                            wrongOptions: questionDto.wrongOptions,
                            mediasPath: questionDto.mediasPath,
                            explanation: questionDto.explanation,
                            difficulty: questionDto.difficulty,
                        },
                    });

                    return question;
                })
            );

            return createdQuestions;
        }, {
            maxWait: 99999999,
            timeout: 9999999,
        });
    }



    async getAllQuestions() {
        return this.prismaService.question.findMany({});
    }

    async getTextOfAllQuestions() {
        return this.prismaService.question.findMany({
            select: {
                id: true,
                questionText: true
            }
        });
    }

    async getQuestionAtIndex(index: number): Promise<Question | null> {
        const count = await this.prismaService.question.count();

        if (index < 0 || index >= count)
            return null;

        const [question] = await this.prismaService.question.findMany({
            take: 1,
            skip: index,
        });

        return question;
    }

    async getRandomQuestion(): Promise<Question | null> {
        const count = await this.prismaService.question.count();

        if (count === 0)
            return null;

        const randomSkip = Math.floor(Math.random() * count);

        const [question] = await this.prismaService.question.findMany({
            take: 1,
            skip: randomSkip,
        });

        return question;
    }

    async deleteQuestion(id: string) {
        return this.prismaService.question.delete({
            where: { id }
        });
    }

}
