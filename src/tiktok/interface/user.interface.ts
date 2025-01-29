export interface UserBadge {
    type: string;
    badgeSceneType: number;
    displayType: number;
    url: string;
}

export interface UserDetails {
    createTime: string;
    bioDescription: string;
    profilePictureUrls: string[];
}

export interface FollowInfo {
    followingCount: number;
    followerCount: number;
    followStatus: number;
    pushStatus: number;
}

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