import * as SibApiV3Sdk from "@sendinblue/client";
import { PrismaClient, StoryStatus } from "@prisma/client";
import { EventPublishPost } from "../utils/types";

const prisma = new PrismaClient();

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
apiInstance.setApiKey(
    SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey,
    process.env.SENDINBLUE_API_KEY as string
);

export const sendEmail = async (
    event: EventPublishPost,
    status: StoryStatus
) => {
    const organization = await prisma.organization.findUnique({
        where: {
            id: event.organizationId,
        },
        include: {
            users: {
                include: {
                    user: true,
                },
            },
        },
    });

    const story = await prisma.story.findUnique({
        where: {
            id: event.storyId,
        },
        include: {
            posts: {
                take: 1,
            },
        },
    });

    const emailsUsers =
        organization?.users?.map((userToOrga) => userToOrga.user.email) ?? [];

    switch (status) {
        case StoryStatus.PUBLISHED:
            const instaLink = `https://instagram.com/stories/${
                event.credentials.username
            }/${story.posts[0]?.socialPostId ?? ""}`;
            for (const email of emailsUsers) {
                await sendEmailSuccess(
                    email,
                    story.name,
                    instaLink
                );
            }
			break;
        case StoryStatus.ERROR:
            const challengeAppLink = `${
                process.env.FRONT_END_APP ?? "http://localhost:3000"
            }/dashboard/${organization.id}/restaurant/${
                event.restaurantId
            }/stories`;
			for (const email of emailsUsers) {
				await sendEmailError(
					email,
					story.name,
					challengeAppLink
				);
			}
			break;
        default:
            break;
    }
};

const sendEmailSuccess = (
    to: string,
    storyName: string,
    linkToSeeStory: string
) => {
    return apiInstance
        .sendTransacEmail({
            to: [{ email: to }],
            params: { name: storyName, link: linkToSeeStory },
            templateId: 4,
        })
        .then(
            function (data: unknown) {
                console.log(`API called successfully. Returned data: ${data}`);
                return data;
            },
            function (error: unknown) {
                console.error(error);
                return error;
            }
        );
};

const sendEmailError = (to: string, storyName: string, linkToGoApp: string) => {
    return apiInstance
        .sendTransacEmail({
            to: [{ email: to }],
            params: { name: storyName, link: linkToGoApp },
            templateId: 7,
        })
        .then(
            function (data: unknown) {
                console.log(`API called successfully. Returned data: ${data}`);
                return data;
            },
            function (error: unknown) {
                console.error(error);
                return error;
            }
        );
};
