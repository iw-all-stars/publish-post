import { PrismaClient, StoryStatus } from "@prisma/client";
import { PostPublisherService } from "./services/postPublisher.service";

const prisma = new PrismaClient();

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

export async function handler(event: EventPublishPost): Promise<any> {
    let status: StoryStatus
    try {
        console.info("[START_PUBLISH] : ", event);
        const postPublisher = new PostPublisherService();
        const publishedPosts = await postPublisher.publishPost(event);
		await setSocialIds(publishedPosts);
        status = StoryStatus.PUBLISHED;
    } catch (e) {
        console.error("[ERROR] : ", e);
        status = StoryStatus.ERROR;
    } finally {
        await updateStoryStatus(event, status);
        console.info(`[END_PUBLISH] [STATUS=${status}] : `, event);
        return;
    }
}

async function updateStoryStatus(
    event: EventPublishPost,
    state: StoryStatus,
) {
	return prisma.story.update({
		where: {
			id: event.posts[0].storyId,
		},
		data: {
			status: state,
		}
	})
}

async function setSocialIds(publishedPosts: {
    postId: string;
    socialId: string;
}[]) {
	return Promise.all(publishedPosts.map((post) => 
		 prisma.post.update({
			where: {
				id: post.postId,
			},
			data: {
				socialPostId: post.socialId,
			}
		})
	))
}
