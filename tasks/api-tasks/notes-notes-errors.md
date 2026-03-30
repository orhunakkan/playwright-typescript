# Notes API — Notes Error Handling

## URLs

- `POST https://practice.expandtesting.com/notes/api/users/register`
- `POST https://practice.expandtesting.com/notes/api/users/login`
- `POST https://practice.expandtesting.com/notes/api/notes`
- `GET https://practice.expandtesting.com/notes/api/notes`
- `GET https://practice.expandtesting.com/notes/api/notes/{id}`
- `PUT https://practice.expandtesting.com/notes/api/notes/{id}`
- `DELETE https://practice.expandtesting.com/notes/api/notes/{id}`

## Overview

Verify that the notes endpoints respond with the correct error codes and messages when requests are invalid or unauthorized. These tests run in a fixed order. The first test is a setup step that obtains a valid auth token for use in subsequent tests.

## Tests

1. Register a new user and log in to obtain a valid auth token. This is setup only — no assertions beyond confirming a token was received.

2. Attempt to create a note without including any auth token. Verify the response status is 401.

3. Attempt to create a note using a fake or malformed auth token. Verify the response status is 401.

4. Attempt to create a note with a valid auth token but without providing a title. Verify the response status is 400.

5. Attempt to create a note with a valid auth token but with a category value that does not exist. Verify the response status is 400.

6. Attempt to retrieve all notes without including any auth token. Verify the response status is 401.

7. Attempt to retrieve a note using an ID that does not exist. Verify the response status is 404.

8. Attempt to update a note using an ID that does not exist. Verify the response status is 400.

9. Attempt to delete a note using an ID that does not exist. Verify the response status is 404.

10. Create a note, delete it successfully, then attempt to retrieve it again by its ID. Verify the response status is 404.
