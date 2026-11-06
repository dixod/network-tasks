import { afterAll, beforeAll, describe, expect, it } from "@jest/globals";
import { once } from "node:events";
import { request } from "node:http";
import type { OutgoingHttpHeaders } from "node:http";
import { MAX_BODY_BYTES } from "./body";
import { usersServer } from "./users-server";

let baseUrl: string;

beforeAll(async () => {
    usersServer.listen(0, "127.0.0.1");
    await once(usersServer, "listening");
    const address = usersServer.address();
    if (address === null || typeof address === "string") throw new Error("Expected a TCP port");
    baseUrl = `http://127.0.0.1:${address.port}`;
});

afterAll(async () => {
    if (!usersServer.listening) return;
    usersServer.closeAllConnections();
    await new Promise<void>((resolve, reject) => {
        usersServer.close(error => error ? reject(error) : resolve());
    });
});

function post(body: string) {
    return fetch(`${baseUrl}/users`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body
    });
}

function stream(body?: Buffer, finish = true): Promise<{ status: number | undefined; body: unknown }> {
    return new Promise((resolve, reject) => {
        const headers: OutgoingHttpHeaders = { "Content-Type": "application/json" };
        if (body === undefined) headers["Content-Length"] = String(MAX_BODY_BYTES + 1);
        else headers["Transfer-Encoding"] = "chunked";

        const client = request(`${baseUrl}/users`, { method: "POST", headers, agent: false }, response => {
            let text = "";
            response.setEncoding("utf8");
            response.on("data", chunk => { text += chunk; });
            response.on("error", reject);
            response.on("end", () => {
                try { resolve({ status: response.statusCode, body: JSON.parse(text) }); }
                catch (error) { reject(error); }
                finally { client.destroy(); }
            });
        });
        client.on("error", reject);
        client.setTimeout(3000, () => client.destroy(new Error("Request timed out")));

        if (body === undefined) client.flushHeaders();
        else if (finish) client.end(body);
        else client.write(body);
    });
}

describe("POST /users", () => {
    it("creates a user and ignores extra fields", async () => {
        const response = await post('{"name":"Anna","age":25,"admin":true}');
        expect(response.status).toBe(201);
        expect(response.headers.get("content-type")).toContain("application/json");
        expect(await response.json()).toEqual({ name: "Anna", age: 25 });
    });

    it.each(["", "{broken", "null", "[]", '"Anna"', "25"])("rejects invalid input: %p", async body => {
        const response = await post(body);
        expect(response.status).toBe(400);
        expect(await response.json()).toEqual({ error: expect.any(String) });
    });

    it.each([undefined, "text/plain"])("rejects Content-Type=%s", async contentType => {
        const headers: Record<string, string> = {};
        if (contentType !== undefined) headers["Content-Type"] = contentType;
        const response = await fetch(`${baseUrl}/users`, { method: "POST", headers, body: "{}" });
        expect(response.status).toBe(415);
        expect(await response.json()).toEqual({ error: "Expected application/json" });
    });

    it("returns 404 for another path", async () => {
        const response = await fetch(`${baseUrl}/other`);
        expect(response.status).toBe(404);
        expect(await response.json()).toEqual({ error: "Not Found" });
    });

    it("returns 405 with Allow: POST for another method", async () => {
        const response = await fetch(`${baseUrl}/users`);
        expect(response.status).toBe(405);
        expect(response.headers.get("allow")).toBe("POST");
        expect(await response.json()).toEqual({ error: "Method Not Allowed" });
    });

    it("rejects oversized Content-Length without receiving the body", async () => {
        const response = await stream();
        expect(response.status).toBe(413);
        expect(response.body).toEqual({ error: "Payload Too Large" });
    });

    it("accepts valid JSON exactly at the byte limit", async () => {
        const json = '{"name":"Anna","age":25}';
        const body = Buffer.from(json + " ".repeat(MAX_BODY_BYTES - Buffer.byteLength(json)));
        const response = await stream(body);
        expect(response.status).toBe(201);
        expect(response.body).toEqual({ name: "Anna", age: 25 });
    });

    it("limits UTF-8 bytes without waiting for the stream to end", async () => {
        const body = Buffer.from("é".repeat(MAX_BODY_BYTES / 2 + 1));
        const response = await stream(body, false);
        expect(response.status).toBe(413);
        expect(response.body).toEqual({ error: "Payload Too Large" });
    });

    it("rejects malformed UTF-8 instead of changing the name", async () => {
        const body = Buffer.concat([
            Buffer.from('{"name":"'), Buffer.from([0xc3, 0x28]), Buffer.from('","age":25}')
        ]);
        const response = await stream(body);
        expect(response.status).toBe(400);
        expect(response.body).toEqual({ error: "Invalid JSON" });
    });
});
