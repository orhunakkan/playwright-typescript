import { expect, test } from '@playwright/test';

const baseURL = 'https://restful-booker.herokuapp.com';

test.describe('restful-booker APIs', () => {
  test('should create token', async ({request}) => {
    const response = await request.post(
      `${baseURL}/auth`,
      {
        username : "admin",
        password : "password123"
      });
    expect(response.status()).toEqual(200);
  });

  test('should get Booking Ids', async ({request}) => {
    const response = await request.get(`${baseURL}/booking`);
    expect(response.status()).toEqual(200);
  });
})