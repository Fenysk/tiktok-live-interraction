import { Injectable } from '@nestjs/common';
import { WebcastPushConnection } from 'tiktok-live-connector';
import { ChatMessage } from './interface/user.interface';
import { GAME_CONSTANTS } from 'src/game/constants/game.constants';
import { LikeMessage } from './interface/like.interface';


@Injectable()
export class TiktokService {
    private tiktokUsername = GAME_CONSTANTS.TIKTOK_STREAM_ACCOUNT;
    private tiktokLiveConnection = new WebcastPushConnection(this.tiktokUsername);
    private messageHandlers: Array<(userId: string, nickname: string, profilePictureUrl:string, message: string) => void> = [];
    private likeHandlers: Array<(userId: string, nickname: string, likeCount: number) => void> = [];
    private reconnectAttempts = 0;
    private readonly MAX_RECONNECT_ATTEMPTS = 10;
    private readonly RECONNECT_DELAY = 5000;
    private isConnected = false;

    onChatMessage(handler: (userId: string, nickname: string, profilePictureUrl:string, message: string) => void): void {
        this.messageHandlers.push(handler);
    }

    onLike(handler: (userId: string, nickname: string, likeCount: number) => void): void {
        this.likeHandlers.push(handler);
    }

    async initTikTokLiveConnection() {
        console.log('Connecting to TikTok live...');
        
        if (this.isConnected) {
            console.info('Already connected to TikTok live');
            return;
        }

        try {
            const state = await this.tiktokLiveConnection.connect();
            console.info(`Connected to roomId ${state.roomId}`);
            this.reconnectAttempts = 0;
            this.isConnected = true;

            this.tiktokLiveConnection.on('chat', (data: ChatMessage) => {
                this.messageHandlers.forEach(handler =>
                    handler(data.userId, data.nickname, data.profilePictureUrl, data.comment)
                );
            });

            this.tiktokLiveConnection.on('disconnected', () => {
                console.warn('Disconnected from TikTok live');
                this.isConnected = false;
                this.handleReconnect();
            });

            this.tiktokLiveConnection.on('like', (data: LikeMessage) => {
                this.likeHandlers.forEach(handler =>
                    handler(data.userId, data.nickname, data.likeCount)
                );
            });

            this.tiktokLiveConnection.on('gift', data  => {
                this.likeHandlers.forEach(handler =>
                    handler(data.userId, data.nickname, data.likeCount)
                );
                console.log(`${data}`);
            });

        } catch (err) {
            console.error('Failed to connect', err);
            this.isConnected = false;
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