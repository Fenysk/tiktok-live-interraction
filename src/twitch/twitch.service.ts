import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Client } from 'tmi.js';
import { GAME_CONSTANTS } from 'src/game/constants/game.constants';
import { ChatMessage } from 'src/tiktok/interface/chat.interface';
import { FollowInfo, UserDetails } from 'src/tiktok/interface/user.interface';
import { NewViewerMessage } from 'src/tiktok/interface/new-viewer.interface';
import { TwitchEvent } from './enums/twitch-event.enum';

@Injectable()
export class TwitchService implements OnModuleInit, OnModuleDestroy {
    private twitchChannelName = GAME_CONSTANTS.TWITCH_CHANNEL_NAME;
    private chatClient: Client;
    private messageSubscribers: ((data: ChatMessage) => void)[] = [];
    private newViewerSubscribers: ((data: NewViewerMessage) => void)[] = [];

    private readonly MAX_RECONNECT_ATTEMPTS = 10;
    private readonly RECONNECT_DELAY = 5000;

    private reconnectAttempts = 0;
    private isConnected = false;

    constructor() {
        this.chatClient = new Client({
            channels: [this.twitchChannelName],
            connection: {
                reconnect: true,
                secure: true
            }
        });

        this.chatClient.on('disconnected', () => {
            this.isConnected = false;
            this.initTwitchConnection();
        });
    }

    async onModuleInit() {
        this.initTwitchConnection();
    }

    async onModuleDestroy() {
        await this.chatClient.disconnect();
    }

    private initializeListeners(): void {
        this.chatClient.on(TwitchEvent.NEW_MESSAGE, (channel: string, userstate: any, message: string, self: boolean) => {
            if (self) return;

            const chatMessage: ChatMessage = {
                emotes: [],
                comment: message,
                userId: userstate['user-id'] || '',
                secUid: userstate['user-id'] || '',
                uniqueId: userstate['user-id'] || '',
                nickname: userstate['display-name'] || userstate.username || '',
                profilePictureUrl: 'https://img.freepik.com/vecteurs-premium/logo-twitch_578229-259.jpg',
                followRole: 0,
                userBadges: [],
                userSceneTypes: [],
                userDetails: {} as UserDetails,
                followInfo: {} as FollowInfo,
                isModerator: userstate.mod || false,
                isNewGifter: false,
                isSubscriber: userstate.subscriber || false,
                topGifterRank: {} as any,
                gifterLevel: 0,
                teamMemberLevel: 0,
                msgId: userstate.id || '',
                createTime: new Date().toISOString(),
            };
            this.messageSubscribers.forEach(callback => callback(chatMessage));
        });

    }

    async initTwitchConnection() {
        while (this.reconnectAttempts < this.MAX_RECONNECT_ATTEMPTS) {
            try {
                await this.chatClient.connect();
                this.isConnected = true;
                this.reconnectAttempts = 0;
                console.log('Connected to Twitch chat');
                this.initializeListeners();
                break;
            } catch (error) {
                console.error('Failed to connect to Twitch:', error);
                this.reconnectAttempts++;
                await new Promise(resolve => setTimeout(resolve, this.RECONNECT_DELAY));
            }
        }
    }

    public subscribeToNewMessage(callback: (data: ChatMessage) => void): void {
        this.messageSubscribers.push(callback);
    }

    public unsubscribeFromMessage(callback: (data: ChatMessage) => void): void {
        this.messageSubscribers = this.messageSubscribers.filter(cb => cb !== callback);
    }

    public onNewViewer(callback: (data: NewViewerMessage) => void): void {
        this.newViewerSubscribers.push(callback);
    }
}
