export function generateUniqueString(maxLength: number = 30): string {
    const time = Date.now().toString(36).substring(0, 11);
    const randomLength = maxLength - time.length - 1;
    const random = Math.random().toString(36).substring(2, 2 + randomLength);
    return `${time}_${random}`.substring(0, maxLength);
}