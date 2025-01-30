export interface Gift {
    giftId: number;
    repeatCount: number;
    groupId: string;
    userId: string;
    secUid: string;
    uniqueId: string;
    nickname: string;
    profilePictureUrl: string;
    followRole: number;
    userBadges: Array<{
        type: string;
        badgeSceneType: number;
        displayType: number;
        url: string;
    }>;
    userSceneTypes: number[];
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
    repeatEnd: boolean;
    gift: {
        gift_id: number;
        repeat_count: number;
        repeat_end: number;
        gift_type: number;
    };
    describe: string;
    giftType: number;
    diamondCount: number;
    giftName: string;
    giftPictureUrl: string;
    timestamp: number;
    receiverUserId: string;
}
