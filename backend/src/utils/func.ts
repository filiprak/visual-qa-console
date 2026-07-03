export function normalizeStr(value: string): string {
    return value
        .normalize('NFD')
        .replace(/\p{Diacritic}/gu, '')
        .trim()
        .replace(/\s+/g, ' ')
        .toLowerCase();
}

export function testcaseKey(pipeline_name: string, name: string, group?: string): string {
    return [normalizeStr(pipeline_name), normalizeStr(group || 'default'), normalizeStr(name)]
        .map((v) => `${v.length}:${v}`)
        .join('|');
}
