import { FollowInfo, UserBadge, UserDetails } from "./user.interface";

export interface TiktokGiftMessage {
    giftId: number;
    repeatCount: number;
    groupId: string;
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
    displayType: string;
    label: string;
    repeatEnd: boolean;
    gift: Gift;
    describe: string;
    giftType: number;
    diamondCount: number;
    giftName: string;
    giftPictureUrl: string;
    timestamp: number;
    receiverUserId: string;
}

export interface Gift {
    gift_id: number;
    repeat_count: number;
    repeat_end: number;
    gift_type: number;
}