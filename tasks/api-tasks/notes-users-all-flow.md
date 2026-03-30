# Notes API — Users Full Flow

## URLs

- `POST https://practice.expandtesting.com/notes/api/users/register`
- `POST https://practice.expandtesting.com/notes/api/users/login`
- `GET https://practice.expandtesting.com/notes/api/users/profile`
- `PATCH https://practice.expandtesting.com/notes/api/users/profile`
- `POST https://practice.expandtesting.com/notes/api/users/forgot-password`
- `DELETE https://practice.expandtesting.com/notes/api/users/logout`

## Overview

Test the complete lifecycle of a user account through the API. These tests run in a fixed order where each step depends on the previous one. The auth token obtained at login is reused in all subsequent requests.

## Tests

1. Register a new user with a name, email, and password. Verify the response status is 201 and the response includes a user ID, the user's name, and email address.

2. Log in with the registered user's credentials. Verify the response status is 200. Store the auth token from the response for use in all subsequent requests.

3. Retrieve the user profile using the auth token. Verify the response status is 200 and the profile data matches the registered user.

4. Update the user profile by adding a phone number and company name along with an updated display name. Verify the response status is 200 and confirm all updated fields — name, email, phone, and company — appear correctly in the response.

5. Submit a forgot-password request using the user's email address. Verify the response status is 200 and the response message confirms a password reset email was sent.

6. Log out using the auth token. Verify the response status is 200 and the response includes a success message.

7. Attempt to retrieve the user profile using the now-invalidated auth token. Verify the response status is 401.
