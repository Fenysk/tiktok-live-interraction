import { Injectable } from '@nestjs/common';
import { CreateQuestionRequest } from './dto/create-question.request';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma, Question } from '@prisma/client';
import { FetchQuestionsRequest } from './dto/fetch-questions.request';
import { UpdateQuestionRequest } from './dto/update-question.request';

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


    async fetchQuestions(
        dto: FetchQuestionsRequest
    ): Promise<Question[]> {
        const { sql, join } = Prisma;
        const whereConditions = [];

        if (dto.findInQuestion) {
            whereConditions.push(
                sql`LOWER("questionText") LIKE LOWER('%' || ${dto.query} || '%')`
            );
        }

        if (dto.findInAnswers) {
            whereConditions.push(
                sql`EXISTS (SELECT 1 FROM unnest("correctOptions") AS opt WHERE LOWER(opt) LIKE LOWER('%' || ${dto.query} || '%'))`
            );
            whereConditions.push(
                sql`EXISTS (SELECT 1 FROM unnest("wrongOptions") AS opt WHERE LOWER(opt) LIKE LOWER('%' || ${dto.query} || '%'))`
            );
        }

        if (dto.findInFieldsToComplete) {
            whereConditions.push(
                sql`EXISTS (SELECT 1 FROM unnest("fieldsToComplete") AS field WHERE LOWER(field) LIKE LOWER('%' || ${dto.query} || '%'))`
            );
        }

        const whereClause = whereConditions.length > 0
            ? sql`WHERE ${join(whereConditions, ' OR ')}`
            : sql``;

        const fetchedQuestions = await this.prismaService.$queryRaw<Question[]>`
            SELECT * FROM "Question"
            ${whereClause}
            ORDER BY id
            ${dto.query ? sql`` : sql`LIMIT 20 OFFSET ${(dto.page || 1) - 1} * 20`}
        `;

        return fetchedQuestions;
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

    async updateQuestion(updateQuestionDto: UpdateQuestionRequest) {
        return this.prismaService.question.update({
            where: { id: updateQuestionDto.id },
            data: updateQuestionDto,
        });
    }

    async deleteQuestion(id: string) {
        return this.prismaService.question.delete({
            where: { id }
        });
    }

}
