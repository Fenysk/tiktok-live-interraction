export interface YoutubeChatMessage {
    platform: 'youtube';
    author: string;
    message: string;
    timestamp: string;
    superchat?: {
        amount: string;
        currency: string;
        color: string;
    } | null;
}
