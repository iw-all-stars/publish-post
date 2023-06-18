import { StoryStatus } from "@prisma/client";
import { sendEmail } from "./services/mail.service";
import { PostPublisherService } from "./services/postPublisher.service";
import { setSocialIds, updateStoryStatus } from "./services/status.service";
import { EventPublishPost } from "./utils/types";

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
		await sendEmail(event, status);
        console.info(`[END_PUBLISH] [STATUS=${status}] : `, event);
        return;
    }
}
