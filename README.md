# GET /search

Requires Node.js 24.

Install: `npm.cmd ci`
Start: `npx.cmd ts-node .\src\index.ts`
Tests: `npm.cmd test -- --runInBand`

- GET /search?q=node: 200, {"q":"node"}.
- Missing, empty or whitespace-only q: 400 with a JSON error.
- Another path: 404, {"error":"Not Found"}.
- Another method on /search: 405, {"error":"Method Not Allowed"}, Allow: GET.
- Malformed URL: 400; the server continues running.
