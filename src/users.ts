export function isObjectBody(
    value: unknown
): value is Record<string, unknown> {
    return (
        typeof value === "object" &&
        value !== null &&
        !Array.isArray(value)
    );
}

export function parseUserBody(value: unknown) {
    if (!isObjectBody(value)) {
        return null;
    }

    const name = value.name;
    const age = value.age;

    if (typeof name !== "string" || name.trim() === "") {
        return null;
    }

    if (
        typeof age !== "number" ||
        !Number.isInteger(age) ||
        age < 0
    ) {
        return null;
    }

    return { name: name, age: age };
}