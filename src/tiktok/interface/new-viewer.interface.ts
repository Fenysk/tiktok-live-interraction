import { FollowInfo, UserBadge, UserDetails } from "./user.interface";

export interface NewViewerMessage {
    actionId: number;
    userId: string;
    secUid: string;
    uniqueId: string;
    nickname: string;
    profilePictureUrl: string;
    followRole: number;
    userBadges: UserBadge[];
    userDetails: UserDetails;
    followInfo: FollowInfo;
    isModerator: boolean;
    isNewGifter: boolean;
    isSubscriber: boolean;
    topGifterRank: any;
    msgId: string;
    createTime: string;
    displayType: string;
    label: string;
}
