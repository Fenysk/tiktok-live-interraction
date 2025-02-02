export interface User {
    actionId: number;
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
    createTime: string;
    msgId: string;
    displayType: string;
    label: string;
}

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