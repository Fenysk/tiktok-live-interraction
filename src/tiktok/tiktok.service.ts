import { Injectable, OnModuleInit } from '@nestjs/common';
import { WebcastPushConnection } from 'tiktok-live-connector';
import { ChatMessage } from './interface/chat.interface';
import { GAME_CONSTANTS } from 'src/game/constants/game.constants';
import { LikeMessage } from './interface/like.interface';
import { TikTokEvent } from './enums/tiktok-event.enum';
import { GiftMessage } from './interface/gift.interface';
import { NewViewerMessage } from './interface/new-viewer.interface';
import { SubscriptionMessage } from './interface/subscription.interface';
import { FollowMessage } from './interface/follow.interface';
import { ShareMessage } from './interface/share.interface';

@Injectable()
export class TiktokService implements OnModuleInit {
    private tiktokStreamAccount = GAME_CONSTANTS.TIKTOK_STREAM_ACCOUNT;
    private tiktokLiveConnection = new WebcastPushConnection(this.tiktokStreamAccount);

    private newViewerSubscribers: ((data: NewViewerMessage) => void)[] = [];
    private messageSubscribers: ((data: ChatMessage) => void)[] = [];
    private likeSubscribers: ((data: LikeMessage) => void)[] = [];
    private giftSubscribers: ((data: GiftMessage) => void)[] = [];
    private subscriptionSubscribers: ((data: SubscriptionMessage) => void)[] = [];
    private followSubscribers: ((data: FollowMessage) => void)[] = [];
    private shareSubscribers: ((data: ShareMessage) => void)[] = [];

    private readonly MAX_RECONNECT_ATTEMPTS = 10;
    private readonly RECONNECT_DELAY = 5000;

    private reconnectAttempts = 0;
    private isConnected = false;

    constructor() {
        this.tiktokLiveConnection.on(TikTokEvent.LIVE_DISCONNECTED, () => {
            this.isConnected = false;
            this.initTikTokLiveConnection();
        });

        this.tiktokLiveConnection.on(TikTokEvent.NEW_VIEWER, (data: NewViewerMessage) => {
            this.newViewerSubscribers.forEach(callback => callback(data));
        });

        this.tiktokLiveConnection.on(TikTokEvent.NEW_MESSAGE, (data: ChatMessage) => {
            this.messageSubscribers.forEach(callback => callback(data));
        });

        this.tiktokLiveConnection.on(TikTokEvent.NEW_LIKE, (data: LikeMessage) => {
            this.likeSubscribers.forEach(callback => callback(data));
        });

        this.tiktokLiveConnection.on(TikTokEvent.NEW_GIFT, (data: GiftMessage) => {
            this.giftSubscribers.forEach(callback => callback(data));
        });

        this.tiktokLiveConnection.on(TikTokEvent.NEW_SUBSCRIPTION, (data: SubscriptionMessage) => {
            this.subscriptionSubscribers.forEach(callback => callback(data));
        });

        this.tiktokLiveConnection.on(TikTokEvent.FOLLOW, (data: FollowMessage) => {
            this.followSubscribers.forEach(callback => callback(data));
        });

        this.tiktokLiveConnection.on(TikTokEvent.SHARE, (data: ShareMessage) => {
            this.shareSubscribers.forEach(callback => callback(data));
        });
    }
    async onModuleInit() {
        await this.initTikTokLiveConnection();
    }

    async initTikTokLiveConnection() {
        if (this.isConnected) return console.log('Already connected to TikTok Live');

        while (this.reconnectAttempts < this.MAX_RECONNECT_ATTEMPTS) {
            try {
                await this.tiktokLiveConnection.connect();
                this.isConnected = true;
                this.reconnectAttempts = 0;
                console.log('Connected to TikTok Live');
                return;
            } catch (err) {
                this.reconnectAttempts++;
                console.log(`Connection attempt ${this.reconnectAttempts} failed. Retrying in ${this.RECONNECT_DELAY / 1000} seconds...`);
                await new Promise(resolve => setTimeout(resolve, this.RECONNECT_DELAY));
            }
        }
        console.log('Max reconnect attempts reached. Failed to connect to TikTok Live.');
    }

    subscribeToNewViewer(callback: (data: NewViewerMessage) => void): void {
        this.newViewerSubscribers.push(callback);
    }

    subscribeToMessage(callback: (data: ChatMessage) => void): void {
        this.messageSubscribers.push(callback);
    }

    subscribeToLike(callback: (data: LikeMessage) => void): void {
        this.likeSubscribers.push(callback);
    }

    subscribeToGift(callback: (data: GiftMessage) => void): void {
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
}