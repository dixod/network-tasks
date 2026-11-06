# HTTP tasks

Run commands from the project root.

```powershell
npm.cmd ci
npx.cmd tsc --noEmit
npm.cmd test -- --runInBand
```

## Task 1: search

```powershell
npx.cmd ts-node .\src\index.ts
```

`GET http://localhost:3000/search?q=node` returns `200` and `{"q":"node"}`.
An absent, empty or whitespace-only `q` returns `400`. Another path returns
`404` with `{"error":"Not Found"}`. A non-GET method on `/search` returns
`405` with `{"error":"Method Not Allowed"}` and `Allow: GET`.
Malformed URLs return `400` instead of stopping the server.

## Task 2: users

Stop the search server first: both entry points use port 3000.

```powershell
npx.cmd ts-node .\src\users-index.ts
```

Send `POST /users` with `Content-Type: application/json`:

```json
{"name":"Anna","age":25,"admin":true}
```

Response: `201 Created` and `{"name":"Anna","age":25}`. Extra fields are
ignored. The JSON root must be an object, not null, an array or a primitive.

Field rules chosen for this exercise: `name` is a non-blank string; `age` is a
non-negative integer, including zero. Accepted names are returned as supplied.
These detailed field rules were not specified in the assignment. Users are
returned without database storage or generated IDs.

The body limit is **1 MB = 1,000,000 bytes**. Exactly that size is allowed if
the JSON and user are valid. An oversized Content-Length is rejected before
reading the body. Received bytes are also counted, including for chunked
requests without Content-Length. Invalid UTF-8 is rejected. On errors the
connection closes after the JSON response is sent.

| Status | Reason |
| --- | --- |
| `201` | Valid user; response contains only name and age |
| `400` | Invalid JSON, UTF-8, URL, root value or user fields |
| `404` | Path is not /users |
| `405` | Method is not POST; includes Allow: POST |
| `413` | Declared or received body exceeds 1,000,000 bytes |
| `415` | Missing or non-JSON Content-Type |
| `500` | Unexpected server error |

Application errors use `{"error":"message"}`. Node.js may reject malformed HTTP
framing before the handler; those protocol-level responses may not be JSON.

## Tests

`search.test.ts`, `users.test.ts` and `body.test.ts` contain unit tests.
`users.integration.test.ts` sends real HTTP requests to a temporary local
server on a free port and closes it afterwards. No manually started server
is needed for tests.
