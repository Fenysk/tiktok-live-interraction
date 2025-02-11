import { Injectable, OnModuleInit } from '@nestjs/common';
import { WebcastPushConnection as TiktokLiveConnector } from 'tiktok-live-connector';
import { ChatMessage } from './interface/chat.interface';
import { GAME_CONSTANTS } from 'src/game/constants/game.constants';
import { LikeMessage } from './interface/like.interface';
import { TikTokEvent } from './enums/tiktok-event.enum';
import { TiktokGiftMessage } from './interface/gift.interface';
import { NewViewerMessage } from './interface/new-viewer.interface';
import { SubscriptionMessage } from './interface/subscription.interface';
import { FollowMessage } from './interface/follow.interface';
import { ShareMessage } from './interface/share.interface';

@Injectable()
export class TiktokService implements OnModuleInit {
    private tiktokStreamAccount = GAME_CONSTANTS.TIKTOK_STREAM_ACCOUNT;
    private tiktokLiveConnector = new TiktokLiveConnector(this.tiktokStreamAccount, {
        processInitialData: false,
        fetchRoomInfoOnConnect: false,
        requestOptions: { timeout: 10000 },
        websocketOptions: { timeout: 10000 }
    });

    private newViewerSubscribers: ((data: NewViewerMessage) => void)[] = [];
    private messageSubscribers: ((data: ChatMessage) => void)[] = [];
    private likeSubscribers: ((data: LikeMessage) => void)[] = [];
    private giftSubscribers: ((data: TiktokGiftMessage) => void)[] = [];
    private subscriptionSubscribers: ((data: SubscriptionMessage) => void)[] = [];
    private followSubscribers: ((data: FollowMessage) => void)[] = [];
    private shareSubscribers: ((data: ShareMessage) => void)[] = [];

    private readonly MAX_RECONNECT_ATTEMPTS = 10;
    private readonly RECONNECT_DELAY = 5000;

    private reconnectAttempts = 0;
    private isConnected = false;

    constructor() {
        this.tiktokLiveConnector.on(TikTokEvent.LIVE_DISCONNECTED, () => {
            this.isConnected = false;
            this.initTikTokLiveConnection();
        });
    }

    async onModuleInit() {
        this.initTikTokLiveConnection();        
    }

    private initializeListeners(): void {
        this.tiktokLiveConnector.on(TikTokEvent.NEW_VIEWER, (data: NewViewerMessage) => {
            this.newViewerSubscribers.forEach(callback => callback(data));
        });

        this.tiktokLiveConnector.on(TikTokEvent.NEW_MESSAGE, (data: ChatMessage) => {
            this.messageSubscribers.forEach(callback => callback(data));
        });

        this.tiktokLiveConnector.on(TikTokEvent.NEW_LIKE, (data: LikeMessage) => {
            this.likeSubscribers.forEach(callback => callback(data));
        });

        this.tiktokLiveConnector.on(TikTokEvent.NEW_GIFT, (data: TiktokGiftMessage) => {
            this.giftSubscribers.forEach(callback => callback(data));
        });

        this.tiktokLiveConnector.on(TikTokEvent.NEW_SUBSCRIPTION, (data: SubscriptionMessage) => {
            this.subscriptionSubscribers.forEach(callback => callback(data));
        });

        this.tiktokLiveConnector.on(TikTokEvent.FOLLOW, (data: FollowMessage) => {
            this.followSubscribers.forEach(callback => callback(data));
        });

        this.tiktokLiveConnector.on(TikTokEvent.SHARE, (data: ShareMessage) => {
            this.shareSubscribers.forEach(callback => callback(data));
        });
    }

    async initTikTokLiveConnection() {
        while (this.reconnectAttempts < this.MAX_RECONNECT_ATTEMPTS) {
            try {
                await this.tiktokLiveConnector.connect();
                this.isConnected = true;
                this.reconnectAttempts = 0;
                console.log('Connected to TikTok Live');
                this.initializeListeners();
                return;
            } catch (error) {
                console.error('Failed to connect to TikTok Live', error);
                this.reconnectAttempts++;
                if (this.reconnectAttempts < this.MAX_RECONNECT_ATTEMPTS) {
                    console.log(`Retrying in ${this.RECONNECT_DELAY / 1000} seconds...`);
                    await new Promise(resolve => setTimeout(resolve, this.RECONNECT_DELAY));
                }
            }
        }

        console.error('Max retries reached. Unable to connect to TikTok Live.');
    }

    subscribeToNewViewer(callback: (data: NewViewerMessage) => void): void {
        this.newViewerSubscribers.push(callback);
    }

    subscribeToNewMessage(callback: (data: ChatMessage) => void): void {
        this.messageSubscribers.push(callback);
    }

    subscribeToLike(callback: (data: LikeMessage) => void): void {
        this.likeSubscribers.push(callback);
    }

    subscribeToGift(callback: (data: TiktokGiftMessage) => void): void {
        this.giftSubscribers.push(callback);
    }

    subscribeToSubscription(callback: (data: SubscriptionMessage) => void): void {
        this.subscriptionSubscribers.push(callback);
    }

    subscribeToFollow(callback: (data: FollowMessage) => void): void {
        this.followSubscribers.push(callback);
    }

    subscribeToShare(callback: (data: ShareMessage) => void): void {
        this.shareSubscribers.push(callback);
    }

    simulateEvent(event: TikTokEvent, data: any): void {
        const eventMap = {
            [TikTokEvent.NEW_MESSAGE]: this.messageSubscribers,
            [TikTokEvent.NEW_VIEWER]: this.newViewerSubscribers,
            [TikTokEvent.NEW_LIKE]: this.likeSubscribers,
            [TikTokEvent.NEW_GIFT]: this.giftSubscribers,
            [TikTokEvent.NEW_SUBSCRIPTION]: this.subscriptionSubscribers,
            [TikTokEvent.FOLLOW]: this.followSubscribers,
            [TikTokEvent.SHARE]: this.shareSubscribers,
        };

        const subscribers = eventMap[event];

        console.log(`Simulating event: ${event} with data:`, JSON.stringify(data).substring(0, 20) + '.....' + JSON.stringify(data).slice(-20));

        if (subscribers) {
            console.log(`Subscribers for event: ${event}`, subscribers.length);
            subscribers.forEach(callback => callback(data));
        } else {
            console.error(`Unknown event: ${event}`);
        }
    }
}