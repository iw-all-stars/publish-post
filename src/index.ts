import { PostPublisherService } from "./services/postPublisher.service";

export type Credentials = {
    username: string;
    password: string;
};

export enum PlatformKeys {
    INSTAGRAM = "instagram",
    FACEBOOK = "facebook", // not implemented
    TIKTOK = "tiktok", // not implemented
}

export type Post = {
    url: string;
    type: "image" | "video";
    cover?: string;
};

export type EventPublishPost = {
    credentials: Credentials;
    platformKey: PlatformKeys;
    posts: Post[];
};

export async function handler(event: EventPublishPost): Promise<any> {
    try {
        console.log("event >> : ", event);
        const postPublisher = new PostPublisherService();
        await postPublisher.publishPost(event);
        return true;
    } catch (e) {
        console.log("[ERROR] : ", e);
        return JSON.stringify(e);
    }
}