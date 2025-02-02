export function toSnakeCaseString(str: string): string {
    return str.toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '')
    .replace(/^(\d)/, '_$1');
}