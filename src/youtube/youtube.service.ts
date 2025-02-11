import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { LiveChat } from 'youtube-chat';
import { GAME_CONSTANTS } from 'src/game/constants/game.constants';
import { YoutubeEvent } from './enums/youtube-event.enum';
import { ChatItem as YoutubeMessage, MessageItem } from 'youtube-chat/dist/types/data';
import { ChatMessage } from 'src/tiktok/interface/chat.interface';
import { FollowInfo, UserDetails } from 'src/tiktok/interface/user.interface';

@Injectable()
export class YoutubeService implements OnModuleInit, OnModuleDestroy {
    private youtubeChannelId = GAME_CONSTANTS.YOUTUBE_CHANNEL_ID;
    private liveChat: LiveChat;
    private messageSubscribers: ((data: ChatMessage) => void)[] = [];

    private readonly MAX_RECONNECT_ATTEMPTS = 10;
    private readonly RECONNECT_DELAY = 5000;

    private reconnectAttempts = 0;
    private isConnected = false;

    constructor() {
        this.liveChat = new LiveChat({ channelId: this.youtubeChannelId });

        this.liveChat.on('end', () => {
            this.isConnected = false;
            this.initYoutubeLiveConnection();
        });
    }

    async onModuleInit() {
        this.initYoutubeLiveConnection();  
    }

    private initializeListeners(): void {
        this.liveChat.on(YoutubeEvent.NEW_MESSAGE, (data: YoutubeMessage) => {
            const message: ChatMessage = {
                emotes: [],
                comment: this.extractMessageText(data.message),
                userId: data.author.channelId,
                secUid: data.author.channelId,
                uniqueId: data.author.channelId,
                nickname: data.author.name,
                profilePictureUrl: data.author.thumbnail.url,
                followRole: 0,
                userBadges: [],
                userSceneTypes: [],
                userDetails: {} as UserDetails,
                followInfo: {} as FollowInfo,
                isModerator: data.isModerator,
                isNewGifter: false,
                isSubscriber: data.isMembership,
                topGifterRank: {},
                gifterLevel: 0,
                teamMemberLevel: 0,
                msgId: data.id,
                createTime: new Date(data.timestamp).toISOString(),
            };
            this.messageSubscribers.forEach(callback => callback(message));
        });
    }

    private extractMessageText(message: MessageItem[]): string {
        return message.map(item => {
            if ('text' in item) {
                return item.text;
            } else if ('emojiText' in item) {
                return item.emojiText;
            }
            return '';
        }).join('');
    }

    async initYoutubeLiveConnection() {
        while (this.reconnectAttempts < this.MAX_RECONNECT_ATTEMPTS) {
            try {
                await this.liveChat.start();
                this.isConnected = true;
                this.reconnectAttempts = 0;
                console.log('Connected to YouTube Live');
                this.initializeListeners();
                return;
            } catch (error) {
                console.error('Failed to connect to YouTube Live:', error);
                const axiosError = error as any;
                if (axiosError?.response?.status === 404) {
                    console.error('YouTube Live stream not found. Make sure the channel is currently streaming.');
                    break;
                } else {
                    console.error('Failed to connect to YouTube Live:', error?.message || error);
                }
                
                this.reconnectAttempts++;
                if (this.reconnectAttempts < this.MAX_RECONNECT_ATTEMPTS) {
                    console.log(`Retrying in ${this.RECONNECT_DELAY / 1000} seconds... (Attempt ${this.reconnectAttempts}/${this.MAX_RECONNECT_ATTEMPTS})`);
                    await new Promise(resolve => setTimeout(resolve, this.RECONNECT_DELAY));
                }
            }
        }

        console.error(`Unable to connect to YouTube Live.`);
    }

    subscribeToNewMessage(callback: (data: ChatMessage) => void): void {
        this.messageSubscribers.push(callback);
    }

    unsubscribeFromMessage(callback: (data: ChatMessage) => void): void {
        this.messageSubscribers = this.messageSubscribers.filter(cb => cb !== callback);
    }

    async onModuleDestroy() {
        if (this.liveChat) {
            await this.liveChat.stop();
        }
    }
}
