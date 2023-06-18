import { IgApiClient } from "instagram-private-api";
import { decrypt } from "../utils/decrypt-password";
import { readFileFromRemoteUrl } from "../utils/read_file_from_remote_url";
import { Credentials, EventPublishPost, PlatformKeys, Post, PostType } from "..";

export class PostPublisherService {
    constructor() {}

    async publishPost(event: EventPublishPost): Promise<{ postId: string, socialId: string }[]> {
        switch (event.platformKey) {
            case PlatformKeys.INSTAGRAM:
                const instagramPostPublisher = new InstagramPostPublisher(
                    event.credentials
                );
                return instagramPostPublisher.publishPost(event.posts);
            //case PlatformKeys.FACEBOOK:
            //    // TODO
            //    break;
            //case PlatformKeys.TIKTOK:
            //    // TODO
            //    break;
            default:
                throw new Error("Platform not supported");
        }
    }
}

interface PostPublisher {
    publishPost(posts: Post[]): Promise<{ postId: string, socialId: string }[]>;
}

class InstagramPostPublisher implements PostPublisher {
    private readonly username: string;
    private readonly password: string;

    constructor(credentials: Credentials) {
        this.username = credentials.username;
        this.password = decrypt(credentials.password);
    }

    async publishPost(posts: Post[]): Promise<{ postId: string, socialId: string }[]> {
        const ig = new IgApiClient();
        ig.state.generateDevice(this.username);
        await ig.account.login(this.username, this.password);

        const sortedPosts = posts.sort((a, b) => a.position - b.position);

		const socialPostids: { postId: string, socialId: string }[] = []
        for (const post of sortedPosts) {
            const file = await readFileFromRemoteUrl(post.convertedUrl);
			let res = null
            switch (post.type) {
                case PostType.IMAGE:
                    res = await ig.publish.story({
                        file,
                    });
                    break;
                case PostType.VIDEO:
                    const cover = await readFileFromRemoteUrl(
                        post.cover
                            ? post.cover
                            : "https://challengesem2.s3.eu-west-3.amazonaws.com/assets/black_cover.jpg"
                    );
                    res = await ig.publish.story({
                        video: file,
                        coverImage: cover,
						transcodeDelay: 60_000
                    });
                    break;
                default:
                    throw new Error("Post type not supported");
            }
			socialPostids.push({ 
				postId: post.id,
				socialId: res.media.pk
			 })
        }
		return socialPostids
    }
}