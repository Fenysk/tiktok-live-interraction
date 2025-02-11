import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TiktokModule } from './tiktok/tiktok.module';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { GameModule } from './game/game.module';
import { WebsocketsModule } from './websockets/websockets.module';
import { LikeModule } from './like/like.module';
import { QuestionsModule } from './questions/questions.module';
import { AnswersModule } from './answers/answers.module';
import { KeypressModule } from './keypress/keypress.module';
import { UsersModule } from './users/users.module';
import { StatisticsModule } from './statistics/statistics.module';
import { AnalyseModule } from './analyse/analyse.module';
import { CommonModule } from './common/common.module';
import { YoutubeModule } from './youtube/youtube.module';
import { TwitchModule } from './twitch/twitch.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    TiktokModule,
    GameModule,
    WebsocketsModule,
    LikeModule,
    QuestionsModule,
    AnswersModule,
    KeypressModule,
    UsersModule,
    StatisticsModule,
    AnalyseModule,
    CommonModule,
    YoutubeModule,
    TwitchModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
