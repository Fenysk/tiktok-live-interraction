export enum WebSocketEvents {
    NEW_QUESTION = 'newQuestion',
    QUESTION_TIMEOUT = 'questionTimeout',

    CORRECT_ANSWER = 'correctAnswer',
    WRONG_ANSWER = 'wrongAnswer',
    COOLDOWN_TIMEOUT = 'cooldownTimeout',
    UPDATE_CURRENT_SCORE = 'updateCurrentScore',

    GAME_ENDED = 'gameEnded',

    TOTAL_LIKES = 'totalLikes',

    NEW_GIFT = 'giftReceived',
    NEW_FOLLOWER = 'newFollower',
    NEW_VIEWER= 'newViewer',
  }