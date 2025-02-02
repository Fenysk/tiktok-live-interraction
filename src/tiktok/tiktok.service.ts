import { Injectable } from '@nestjs/common';
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
export class TiktokService {
    private tiktokStreamAccount = GAME_CONSTANTS.TIKTOK_STREAM_ACCOUNT;
    private tiktokLiveConnection = new WebcastPushConnection(this.tiktokStreamAccount);

    private newViewerCallback: (data: any) => void;
    private messageCallback: (data: ChatMessage) => void;
    private likeCallback: (data: LikeMessage) => void;
    private giftCallback: (data: GiftMessage) => void;
    private subscriptionCallback: (data: SubscriptionMessage) => void;
    private followCallback: (data: FollowMessage) => void;
    private shareCallback: (data: ShareMessage) => void;

    private readonly MAX_RECONNECT_ATTEMPTS = 10;
    private readonly RECONNECT_DELAY = 5000;

    private reconnectAttempts = 0;
    private isConnected = false;

    constructor() {
        this.tiktokLiveConnection.on(TikTokEvent.LIVE_DISCONNECTED, () => {
            this.isConnected = false;
            this.handleReconnect();
        });

        this.tiktokLiveConnection.on(TikTokEvent.NEW_VIEWER, (data: NewViewerMessage) => {
            this.newViewerCallback?.(data);
        });

        this.tiktokLiveConnection.on(TikTokEvent.NEW_MESSAGE, (data: ChatMessage) => {
            this.messageCallback?.(data);
        });

        this.tiktokLiveConnection.on(TikTokEvent.NEW_LIKE, (data: LikeMessage) => {
            this.likeCallback?.(data);
        });

        this.tiktokLiveConnection.on(TikTokEvent.NEW_GIFT, (data: GiftMessage) => {
            this.giftCallback?.(data);
        });

        this.tiktokLiveConnection.on(TikTokEvent.NEW_SUBSCRIPTION, (data: SubscriptionMessage) => {
            this.subscriptionCallback?.(data);
        });

        this.tiktokLiveConnection.on(TikTokEvent.FOLLOW, (data: FollowMessage) => {
            this.followCallback?.(data);
        });

        this.tiktokLiveConnection.on(TikTokEvent.SHARE, (data: ShareMessage) => {
            this.shareCallback?.(data);
        });
    }

    async initTikTokLiveConnection() {
        if (this.isConnected) {
            return;
        }

        try {
            const state = await this.tiktokLiveConnection.connect();
            this.reconnectAttempts = 0;
            this.isConnected = true;
        } catch (err) {
            this.isConnected = false;
            this.handleReconnect();
        }
    }

    private async handleReconnect(): Promise<void> {
        if (this.reconnectAttempts >= this.MAX_RECONNECT_ATTEMPTS) {
            console.error('Max reconnect attempts reached');
            return;
        }

        this.reconnectAttempts++;

        setTimeout(async () => {
            try {
                await this.initTikTokLiveConnection();
            } catch (err) {
                console.error('Reconnect failed:', err);
                this.handleReconnect();
            }
        }, this.RECONNECT_DELAY);
    }

    setNewViewerCallback(callback: (data: NewViewerMessage) => void): void {
        this.newViewerCallback = callback;
    }

    setMessageCallback(callback: (data: ChatMessage) => void): void {
        this.messageCallback = callback;
    }

    setLikeCallback(callback: (data: LikeMessage) => void): void {
        this.likeCallback = callback;
    }

    setGiftCallback(callback: (data: GiftMessage) => void): void {
        this.giftCallback = callback;
    }

    setFollowCallback(callback: (data: FollowMessage) => void): void {
        this.followCallback = callback;
    }

    setShareCallback(callback: (data: ShareMessage) => void): void {
        this.shareCallback = callback;
    }

}