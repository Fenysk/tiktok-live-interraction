import { Injectable } from '@nestjs/common';
import { TiktokService } from 'src/tiktok/tiktok.service';
import { NewViewerMessage } from 'src/tiktok/interface/new-viewer.interface';
import { TiktokUser } from 'src/tiktok/interface/user.interface';

@Injectable()
export class UsersService {
    private onlineUsers: TiktokUser[] = [];

    constructor(
        private readonly tiktokService: TiktokService,
    ) {
        this.initializeListeners();
    }

    private initializeListeners(): void {
        this.tiktokService.setNewViewerCallback(this.handleNewViewer.bind(this));
    }

    private handleNewViewer(data: NewViewerMessage): void {
        this.addUserToOnlineUsersList(data);
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
