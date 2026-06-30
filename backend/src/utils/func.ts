export function slugify(input: string): string {
    return input
        .toString()
        .normalize('NFKD') // split accented characters
        .replace(/[\u0300-\u036f]/g, '') // remove diacritics
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '') // remove invalid chars
        .replace(/[\s_-]+/g, '-') // collapse whitespace/underscores into -
        .replace(/^-+|-+$/g, ''); // trim leading/trailing -
}
