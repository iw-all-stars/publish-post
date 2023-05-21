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

export enum PostType {
    IMAGE = "IMAGE",
    VIDEO = "VIDEO",
  }

export type Post = {
    id: string;
    originalUrl: string;
    convertedUrl: string;
    storyId: string;
    position: number;
    type: PostType;
    cover?: string;
};

export type EventPublishPost = {
    restaurantId: string;
    organizationId: string;
    credentials: Credentials;
    platformKey: PlatformKeys;
    posts: Post[];
    callbackUrl: string;
};

enum PublishPostState {
    SUCCESS = "SUCCESS",
    ERROR = "ERROR",
}

export async function handler(event: EventPublishPost): Promise<any> {
    let details = '';
    let state = null;
    try {
        console.info("[START_PUBLISH] : ", event);
        const postPublisher = new PostPublisherService();
        await postPublisher.publishPost(event);
        state = PublishPostState.SUCCESS;
    } catch (e) {
        console.error("[ERROR] : ", e);
        state = PublishPostState.ERROR;
        details = JSON.stringify(e);
    } finally {
        await callCallbackUrl(event, state, details);
        console.info(`[END_PUBLISH] [STATUS=${state}] : `, event);
        return;
    }
}

async function callCallbackUrl(
    event: EventPublishPost,
    state = "",
    details = ""
) {
    await fetch(event.callbackUrl, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "api-key": process.env.API_KEY || "",
        },
        body: JSON.stringify({
            event,
            state,
            details,
        }),
    })
        .then(() => console.info(`[SUCCESS] : called ${event.callbackUrl}`))
        .catch((e) =>
            console.error(`[ERROR] : failed to call ${event.callbackUrl} `, e)
        );
}
