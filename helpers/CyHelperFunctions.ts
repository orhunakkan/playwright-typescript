export async function fillWithDelay(locator: any, text: string, delay: number) {
    for (const char of text) {
        await locator.type(char, { delay });
    }
}