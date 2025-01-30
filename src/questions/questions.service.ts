import { Injectable } from '@nestjs/common';
import { CreateQuestionDto } from './dto/create-question.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class QuestionsService {
    constructor(
        private readonly prismaService: PrismaService,
    ) { }

    async createQuestion(createQuestionDto: CreateQuestionDto) {
        const { text, correctOptionIndex, options } = createQuestionDto;

        return this.prismaService.$transaction(async (tx) => {
            const question = await tx.question.create({
                data: {
                    text,
                    correctOptionId: null,
                    Options: {
                        create: options.map(option => ({
                            text: option.text
                        }))
                    }
                },
                include: {
                    Options: true
                }
            });

            const updatedQuestion = await tx.question.update({
                where: { id: question.id },
                data: {
                    correctOptionId: question.Options[correctOptionIndex].id
                },
                include: {
                    Options: true
                }
            });

            return updatedQuestion;
        });
    }

    async createMultipleQuestion(createQuestionDto: CreateQuestionDto[]) {
        return this.prismaService.$transaction(async (tx) => {
            const createdQuestions = await Promise.all(
                createQuestionDto.map(async (questionDto) => {
                    const { text, correctOptionIndex, options } = questionDto;
    
                    const question = await tx.question.create({
                        data: {
                            text,
                            correctOptionId: null,
                            Options: {
                                create: options.map(option => ({
                                    text: option.text
                                }))
                            }
                        },
                        include: {
                            Options: true
                        }
                    });
    
                    const updatedQuestion = await tx.question.update({
                        where: { id: question.id },
                        data: {
                            correctOptionId: question.Options[correctOptionIndex].id
                        },
                        include: {
                            Options: true
                        }
                    });
    
                    return updatedQuestion;
                })
            );
    
            return createdQuestions;
        }, {
            maxWait: 99999999,
            timeout: 9999999,
        });
    }
    
    

    async getQuestions() {
        return this.prismaService.question.findMany({
            include: {
                Options: true
            }
        });
    }

    async getTextOfQuestions () {
        return this.prismaService.question.findMany({
            select: {
                id: true,
                text: true
            }
        });
    }

    async getRandomQuestion() {
        const count = await this.prismaService.question.count();

        if (count === 0) {
            return null;
        }

        const randomSkip = Math.floor(Math.random() * count);
        
        const [question] = await this.prismaService.question.findMany({
            take: 1,
            skip: randomSkip,
            include: {
                Options: true
            }
        });

        return question;
    }

    async deleteQuestion(id: string) {
        return this.prismaService.question.delete({
            where: { id },
            include: {
                Options: true,
                Answers: true,
            }
        });
    }

}
