import { createServer } from "node:http";
import { isValidQuery, parseSearchUrl } from "./search";

const server = createServer((req, res) => {
    res.setHeader("Content-Type", "application/json");
    const url = parseSearchUrl(req.url);

    if (url === null) {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: "Invalid URL" }));
        return;
    }

    if (url.pathname !== "/search") {
        res.statusCode = 404;
        res.end(JSON.stringify({ error: "Not Found" }));
        return;
    }

    if (req.method !== "GET") {
        res.statusCode = 405;
        res.setHeader("Allow", "GET");
        res.end(JSON.stringify({ error: "Method Not Allowed" }));
        return;
    }

    const q = url.searchParams.get("q");
    if (!isValidQuery(q)) {
        res.statusCode = 400;
        res.end(JSON.stringify({ error: "Missing or empty 'q' parameter" }));
        return;
    }

    res.statusCode = 200;
    res.end(JSON.stringify({ q: q }));
});

server.listen(3000, () => {
    console.log("Server running at http://localhost:3000/");
});
