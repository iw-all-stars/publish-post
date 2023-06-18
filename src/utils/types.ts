import { PlatformKey, PostType } from "@prisma/client";

export type Credentials = {
    username: string;
    password: string;
};

export type EventPost = {
    id: string;
    originalUrl: string;
    convertedUrl: string;
    storyId: string;
    position: number;
    type: PostType;
    cover?: string;
};

export type EventPublishPost = {
    storyId: string;
    restaurantId: string;
    organizationId: string;
    credentials: Credentials;
    platformKey: PlatformKey;
    posts: EventPost[];
    callbackUrl: string;
};