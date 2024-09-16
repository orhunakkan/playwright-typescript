import {expect, test} from '@playwright/test';
import {HomePage} from '../../pages/HomePage';
import {delay} from "../../helpers/utils";

test('UI Test: Check Homepage Title', async ({page}) => {
    const homePage = new HomePage(page);
    await homePage.navigate();
    await delay(2000);
    await homePage.getInnerTitle();
    const title = await homePage.getTitle();
    expect(title).toBe('Example Domain');
});
