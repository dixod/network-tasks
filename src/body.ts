import type { IncomingMessage } from "node:http";
import { isUtf8 } from "node:buffer";

export const MAX_BODY_BYTES = 1_000_000;

export function isContentLengthTooLarge(contentLength: string | undefined): boolean {
    return contentLength !== undefined && Number(contentLength) > MAX_BODY_BYTES;
}

export async function readBody(req: IncomingMessage): Promise<string> {
    const chunks: Buffer[] = [];
    let receivedBytes = 0;

    for await (const chunk of req.iterator({ destroyOnReturn: false })) {
        receivedBytes += chunk.length;
        if (receivedBytes > MAX_BODY_BYTES) {
            throw new Error("BODY_TOO_LARGE");
        }
        chunks.push(chunk);
    }

    const body = Buffer.concat(chunks);
    if (!isUtf8(body)) {
        throw new Error("INVALID_UTF8");
    }
    return body.toString("utf8");
}
