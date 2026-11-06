import { createServer } from "node:http";
import type { ServerResponse } from "node:http";
import { isContentLengthTooLarge, readBody } from "./body";
import { parseUserBody } from "./users";

function sendJson(res: ServerResponse, status: number, body: object): void {
    res.statusCode = status;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    if (status >= 400) res.setHeader("Connection", "close");
    res.end(JSON.stringify(body));
}

export const usersServer = createServer(async (req, res) => {
    try {
        const url = new URL(req.url || "/", "http://localhost:3000");
        if (url.pathname !== "/users") {
            return sendJson(res, 404, { error: "Not Found" });
        }
        if (req.method !== "POST") {
            res.setHeader("Allow", "POST");
            return sendJson(res, 405, { error: "Method Not Allowed" });
        }
        if (isContentLengthTooLarge(req.headers["content-length"])) {
            return sendJson(res, 413, { error: "Payload Too Large" });
        }

        const mediaType = (req.headers["content-type"] || "").split(";")[0] || "";
        if (mediaType.trim().toLowerCase() !== "application/json") {
            return sendJson(res, 415, { error: "Expected application/json" });
        }

        const text = await readBody(req);
        const user = parseUserBody(JSON.parse(text));
        if (user === null) {
            return sendJson(res, 400, { error: "Invalid user data" });
        }
        sendJson(res, 201, user);
    } catch (error) {
        if (res.destroyed || (req.destroyed && !req.complete)) return;

        if (error instanceof Error && error.message === "BODY_TOO_LARGE") {
            return sendJson(res, 413, { error: "Payload Too Large" });
        }
        if (error instanceof SyntaxError ||
            (error instanceof Error && error.message === "INVALID_UTF8")) {
            return sendJson(res, 400, { error: "Invalid JSON" });
        }
        if (typeof error === "object" && error !== null &&
            "code" in error && error.code === "ERR_INVALID_URL") {
            return sendJson(res, 400, { error: "Invalid URL" });
        }
        console.error(error);
        sendJson(res, 500, { error: "Internal Server Error" });
    }
});
