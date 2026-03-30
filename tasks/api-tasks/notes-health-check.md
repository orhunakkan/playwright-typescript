# Notes API — Health Check

## URL

- `GET https://practice.expandtesting.com/notes/api/health-check`

## Overview

Verify that the Notes API is up and running by calling the health check endpoint.

## Tests

- Send a GET request to the health check endpoint and verify the response status is 200, the response contains a success flag set to true, and the message confirms the API is running.
