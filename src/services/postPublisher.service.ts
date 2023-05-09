import { IgApiClient } from "instagram-private-api";
import { decrypt } from "../utils/decrypt-password";
import { readFileFromRemoteUrl } from "../utils/read_file_from_remote_url";
import { Credentials, EventPublishPost, PlatformKeys, Post } from "..";

export class PostPublisherService {
    constructor() {}

    async publishPost(event: EventPublishPost): Promise<void> {
        switch (event.platformKey) {
            case PlatformKeys.INSTAGRAM:
                const instagramPostPublisher = new InstagramPostPublisher(
                    event.credentials
                );
                await instagramPostPublisher.publishPost(event.posts);
                break;
            case PlatformKeys.FACEBOOK:
                // TODO
                break;
            case PlatformKeys.TIKTOK:
                // TODO
                break;
            default:
                throw new Error("Platform not supported");
        }
    }
}

interface PostPublisher {
    publishPost(posts: Post[]): Promise<void>;
}

class InstagramPostPublisher implements PostPublisher {
    private readonly username: string;
    private readonly password: string;

    constructor(credentials: Credentials) {
        this.username = credentials.username;
        this.password = decrypt(credentials.password);
    }

    async publishPost(posts: Post[]): Promise<void> {
        const ig = new IgApiClient();
        ig.state.generateDevice(this.username);
        await ig.account.login(this.username, this.password);

        //
        const sortedPosts = posts.sort((a, b) => a.position - b.position);

        for (const post of sortedPosts) {
            const file = await readFileFromRemoteUrl(post.url);
            switch (post.type) {
                case "image":
                    await ig.publish.story({
                        file,
                    });
                    break;
                case "video":
                    const cover = await readFileFromRemoteUrl(
                        post.cover
                            ? post.cover
                            : "https://challengesem2.s3.eu-west-3.amazonaws.com/cover/black_cover.jpg"
                    );
                    await ig.publish.story({
                        video: file,
                        coverImage: cover,
                    });
                    break;
                default:
                    throw new Error("Post type not supported");
            }
        }
    }
}