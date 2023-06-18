import { PrismaClient, StoryStatus } from "@prisma/client";
import { EventPublishPost } from "../utils/types";

const prisma = new PrismaClient();


export async function updateStoryStatus(
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

export async function setSocialIds(publishedPosts: {
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