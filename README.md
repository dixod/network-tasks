# POST /users

Requires Node.js 24.

Install: `npm.cmd ci`
Start: `npx.cmd ts-node .\src\users-index.ts`
Tests: `npm.cmd test -- --runInBand`

Request: POST /users, Content-Type: application/json.
Example: {"name":"Anna","age":25,"admin":true}
Response: 201, {"name":"Anna","age":25}.

The JSON root must be an object. Extra fields are ignored.
Chosen field rules: name is a non-blank string; age is a non-negative integer.
Zero age is accepted. These detailed field rules were not specified in the assignment.

Body limit: 1,000,000 bytes. Oversized Content-Length is rejected before
reading the body. Actual bytes are also counted for chunked requests.
Malformed UTF-8 is rejected. Users are returned without database storage.

| Status | Reason |
| --- | --- |
| 201 | Valid user |
| 400 | Invalid JSON, UTF-8, URL, root or fields |
| 404 | Unknown path |
| 405 | Method is not POST; Allow: POST |
| 413 | Declared or received body exceeds the limit |
| 415 | Missing or non-JSON Content-Type |
| 500 | Unexpected server error |

Application errors use {"error":"message"}.
Unit and integration tests use Jest. Integration tests start and stop
their own server on a free local port.
