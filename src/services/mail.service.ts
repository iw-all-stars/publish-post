import * as SibApiV3Sdk from "@sendinblue/client";
import { PrismaClient, StoryStatus } from "@prisma/client";
import { EventPublishPost } from "../utils/types";

const prisma = new PrismaClient();

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
apiInstance.setApiKey(
    SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey,
    process.env.SENDINBLUE_API_KEY as string
);

export const sendEmail = async (event: EventPublishPost, status: StoryStatus) => {

	const result = await prisma.organization.findUnique({
		where: {
			id: event.organizationId
		},
		include: {
			user: {
				select: {
					email: true
				}
			}
		}
	})

	switch (status) {
		case StoryStatus.PUBLISHED:
			return sendEmailSuccess(
				result?.user?.email as string,
				event.organizationId,
				"https://www.google.com"
			)
		case StoryStatus.ERROR:
			return sendEmailError(
				result?.user?.email as string,
				event.organizationId,
				"https://www.google.com"
			)
		default:
			break;
	}
}

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

const sendEmailError = (
    to: string,
    storyName: string,
    linkToGoApp: string
) => {
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
