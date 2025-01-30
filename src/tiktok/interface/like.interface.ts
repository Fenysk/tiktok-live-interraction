export interface LikeMessage {
    likeCount: number;
    totalLikeCount: number;
    userId: string;
    secUid: string;
    uniqueId: string;
    nickname: string;
    profilePictureUrl: string;
    followRole: number;
    userBadges: any[];
    userSceneTypes: any[];
    userDetails: {
        createTime: string;
        bioDescription: string;
        profilePictureUrls: string[];
    };
    followInfo: {
        followingCount: number;
        followerCount: number;
        followStatus: number;
        pushStatus: number;
    };
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
}