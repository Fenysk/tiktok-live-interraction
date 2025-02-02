import { Injectable } from '@nestjs/common';
import { TiktokService } from 'src/tiktok/tiktok.service';
import { NewViewerMessage } from 'src/tiktok/interface/new-viewer.interface';
import { TiktokUser } from 'src/tiktok/interface/user.interface';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UsersService {
    private onlineUsers: TiktokUser[] = [];

    constructor(
        private readonly tiktokService: TiktokService,
        private readonly prismaService: PrismaService,
    ) {
        this.initializeListeners();
    }

    private initializeListeners(): void {
        this.tiktokService.setNewViewerCallback(this.handleNewViewer.bind(this));
    }

    async handleNewViewer(data: NewViewerMessage): Promise<void> {
        await this.addUserToDatabase(data);
        this.addUserToOnlineUsersList(data);
    }

    private async addUserToDatabase(newViewerMessage: NewViewerMessage): Promise<void> {
        await this.prismaService.user.upsert({
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
