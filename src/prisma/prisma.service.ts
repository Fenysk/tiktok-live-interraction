import { ConflictException, Injectable, InternalServerErrorException, NotFoundException, OnModuleDestroy, OnModuleInit, Logger } from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    private readonly logger = new Logger(PrismaService.name);

    async onModuleInit() {
        await this.$connect()
            .then(() => this.logger.log('Connected to the database'))
            .catch((error) => this.logger.error('Failed to connect to the database : ', error));
    }

    async onModuleDestroy() {
        await this.$disconnect()
            .then(() => this.logger.log('Disconnected from the database'))
            .catch((error) => this.logger.error('Failed to disconnect from the database : ', error));
    }

    handleError(error: Error): never {
        this.logger.error('Database error:', error);

        if (error.name === 'PrismaClientKnownRequestError') {
            const prismaError = error as Prisma.PrismaClientKnownRequestError;
            switch (prismaError.code) {
                case 'P2002':
                    throw new ConflictException('An entry with this data already exists',
                        {
                            cause: error,
                            description: `Unique constraint failed on fields: ${(prismaError.meta as any)?.target}`
                        });
                case 'P2025':
                    throw new NotFoundException('Resource not found',
                        {
                            cause: error,
                            description: prismaError.meta?.cause as string
                        });
                default:
                    throw new InternalServerErrorException('Database error',
                        {
                            cause: error,
                            description: `Prisma error code: ${prismaError.code}`
                        });
            }
        }
        throw error;
    }

}
