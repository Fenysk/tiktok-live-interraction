import { Injectable } from '@nestjs/common';
import { WebcastPushConnection } from 'tiktok-live-connector';
import { ChatMessage } from './interface/user.interface';


@Injectable()
export class TiktokService {
    private tiktokUsername = "fenysk";
    private tiktokLiveConnection = new WebcastPushConnection(this.tiktokUsername);
    private messageHandlers: Array<(userId: string, nickname: string, message: string) => void> = [];

    onChatMessage(handler: (userId: string, nickname: string, message: string) => void): void {
        this.messageHandlers.push(handler);
    }

    async initTikTokLiveConnection() {
        try {
            const state = await this.tiktokLiveConnection.connect();
            console.info(`Connected to roomId ${state.roomId}`);

            this.tiktokLiveConnection.on('chat', (data: ChatMessage) => {
                this.messageHandlers.forEach(handler =>
                    handler(data.userId, data.nickname, data.comment)
                );
            });

        } catch (err) {
            console.error('Failed to connect', err);
        }
    }
}