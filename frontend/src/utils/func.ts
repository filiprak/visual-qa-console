export const truncateStr = (str: string | undefined, max: number = 80) =>
    str ? (str.length > max ? `${str.slice(0, max - 3)}...` : str) : undefined;