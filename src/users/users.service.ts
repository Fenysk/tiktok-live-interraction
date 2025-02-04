import { Injectable, OnModuleInit } from '@nestjs/common';
import { TiktokService } from 'src/tiktok/tiktok.service';
import { NewViewerMessage } from 'src/tiktok/interface/new-viewer.interface';
import { TiktokUser } from 'src/tiktok/interface/user.interface';
import { PrismaService } from 'src/prisma/prisma.service';
import { GameStateService } from 'src/game/services/game-state.service';
import { ChatMessage } from 'src/tiktok/interface/chat.interface';
import { User } from '@prisma/client';

@Injectable()
export class UsersService implements OnModuleInit {
    private onlineUsers: TiktokUser[] = [];

    constructor(
        private readonly tiktokService: TiktokService,
        private readonly prismaService: PrismaService,
        private readonly gameStateService: GameStateService,
    ) {}

    async onModuleInit() {
        this.initializeListeners();
    }

    private initializeListeners(): void {
        this.tiktokService.subscribeToNewViewer(this.handleNewViewer.bind(this));
        this.tiktokService.subscribeToNewMessage(this.handleNewMessage.bind(this));
    }

    async handleNewViewer(data: NewViewerMessage): Promise<void> {
        await this.addUserToDatabase(data);
        this.addUserToOnlineUsersList(data);
        this.gameStateService.updateOnlineUsers(this.onlineUsers);
    }

    async handleNewMessage(data: ChatMessage) {
        const newViewerMessage = this.mapChatMessageToNewViewerMessage(data);
        await this.handleNewViewer(newViewerMessage);
    }

    private mapChatMessageToNewViewerMessage(chatMessage: ChatMessage): NewViewerMessage {
        return {
            actionId: 1,
            userId: chatMessage.userId,
            secUid: chatMessage.secUid,
            uniqueId: chatMessage.uniqueId,
            nickname: chatMessage.nickname,
            profilePictureUrl: chatMessage.profilePictureUrl,
            followRole: chatMessage.followRole,
            userBadges: chatMessage.userBadges,
            userDetails: chatMessage.userDetails,
            followInfo: chatMessage.followInfo,
            isModerator: chatMessage.isModerator,
            isNewGifter: chatMessage.isNewGifter,
            isSubscriber: chatMessage.isSubscriber,
            topGifterRank: chatMessage.topGifterRank,
            msgId: chatMessage.msgId,
            createTime: chatMessage.createTime,
            displayType: "new_viewer",
            label: "New Viewer"
        };
    }

    private async addUserToDatabase(newViewerMessage: NewViewerMessage): Promise<User> {
        try {
            const user = await this.prismaService.user.upsert({
                where: { uniqueId: newViewerMessage.uniqueId },
                update: {
                    nickname: newViewerMessage.nickname,
                    profilePictureUrl: newViewerMessage.profilePictureUrl,
                },
                create: {
                    uniqueId: newViewerMessage.uniqueId,
                    nickname: newViewerMessage.nickname,
                    profilePictureUrl: newViewerMessage.profilePictureUrl,
                },
            });
            return user;
        } catch (error) {
            console.error('Error adding user to database:', error);
        }
    }

    private addUserToOnlineUsersList(newViewerMessage: NewViewerMessage): void {
        const user = this.onlineUsers.find(userInList => userInList.uniqueId === newViewerMessage.uniqueId);
        if (!user) {
            const newUser: TiktokUser = {
                ...newViewerMessage,
                userSceneTypes: [],
                gifterLevel: 0,
                teamMemberLevel: 0
            };
            this.onlineUsers.push(newUser);
        }
    }

    getOnlineUsers(): TiktokUser[] {
        return this.onlineUsers;
    }
}