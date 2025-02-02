import { FollowInfo, UserDetails, UserBadge } from "./user.interface";

export interface ChatMessage {
    emotes: any[];
    comment: string;
    userId: string;
    secUid: string;
    uniqueId: string;
    nickname: string;
    profilePictureUrl: string;
    followRole: number;
    userBadges: UserBadge[];
    userSceneTypes: number[];
    userDetails: UserDetails;
    followInfo: FollowInfo;
    isModerator: boolean;
    isNewGifter: boolean;
    isSubscriber: boolean;
    topGifterRank: any;
    gifterLevel: number;
    teamMemberLevel: number;
    msgId: string;
    createTime: string;
}