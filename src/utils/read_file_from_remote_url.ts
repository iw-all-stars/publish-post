export const readFileFromRemoteUrl = async (url: string): Promise<Buffer> => {
    const response = await fetch(url);
    const buffer = Buffer.from(await response.arrayBuffer());
    return buffer;
}
