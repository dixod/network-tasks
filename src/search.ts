export function isValidQuery(q: string | null): boolean {
    return q !== null && q.trim() !== "";
}

export function parseSearchUrl(value: string | undefined): URL | null {
    try {
        return new URL(value || "/", "http://localhost:3000");
    } catch {
        return null;
    }
}
