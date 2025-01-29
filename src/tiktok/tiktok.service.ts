import { Injectable } from '@nestjs/common';
import { WebcastPushConnection } from 'tiktok-live-connector';
import { ChatMessage } from './interface/user.interface';


@Injectable()
export class TiktokService {
    private tiktokUsername = "fenysk";
    private tiktokLiveConnection = new WebcastPushConnection(this.tiktokUsername);
    private messageHandlers: Array<(userId: string, nickname: string, message: string) => void> = [];
    private reconnectAttempts = 0;
    private readonly MAX_RECONNECT_ATTEMPTS = 100;
    private readonly RECONNECT_DELAY = 5000;

    onChatMessage(handler: (userId: string, nickname: string, message: string) => void): void {
        this.messageHandlers.push(handler);
    }

    async initTikTokLiveConnection() {
        try {
            const state = await this.tiktokLiveConnection.connect();
            console.info(`Connected to roomId ${state.roomId}`);
            this.reconnectAttempts = 0;

            this.tiktokLiveConnection.on('chat', (data: ChatMessage) => {
                this.messageHandlers.forEach(handler =>
                    handler(data.userId, data.nickname, data.comment)
                );
            });

            this.tiktokLiveConnection.on('disconnected', () => {
                console.warn('Disconnected from TikTok live');
                this.handleReconnect();
            });

        } catch (err) {
            console.error('Failed to connect', err);
            this.handleReconnect();
        }
    }

    private async handleReconnect(): Promise<void> {
        if (this.reconnectAttempts >= this.MAX_RECONNECT_ATTEMPTS) {
            console.error('Max reconnection attempts reached');
            return;
        }

        this.reconnectAttempts++;
        console.info(`Attempting to reconnect (${this.reconnectAttempts}/${this.MAX_RECONNECT_ATTEMPTS})...`);

        setTimeout(async () => {
            await this.initTikTokLiveConnection();
        }, this.RECONNECT_DELAY);
    }
}