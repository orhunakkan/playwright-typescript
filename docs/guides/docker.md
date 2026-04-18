# 🐳 Playwright — Docker

> **Source:** [playwright.dev/docs/docker](https://playwright.dev/docs/docker)

---

## Introduction

`Dockerfile.noble` can be used to run Playwright scripts in Docker environment. This image includes the Playwright browsers and browser system dependencies. The Playwright package/dependency is not included in the image and should be installed separately.

---

## Usage

This Docker image is published to Microsoft Artifact Registry.

> **Note:** This Docker image is intended to be used for testing and development purposes only. It is not recommended to use this Docker image to visit untrusted websites.

### Pull the image

```bash
docker pull mcr.microsoft.com/playwright:v1.58.2-noble
```

---

## Run the image

By default, the Docker image will use the root user to run the browsers. This will disable the Chromium sandbox which is not available with root. If you run trusted code (e.g. End-to-end tests) and want to avoid the hassle of managing separate user then the root user may be fine. For web scraping or crawling, we recommend to create a separate user inside the Docker container and use the seccomp profile.

### End-to-end tests

On trusted websites, you can avoid creating a separate user and use root for it since you trust the code which will run on the browsers.

```bash
docker run -it --rm --ipc=host mcr.microsoft.com/playwright:v1.58.2-noble /bin/bash
```

### Crawling and scraping

On untrusted websites, it's recommended to use a separate user for launching the browsers in combination with the seccomp profile. Inside the container or if you are using the Docker image as a base image you have to use `adduser` for it.

```bash
docker run -it --rm --ipc=host --user pwuser --security-opt seccomp=seccomp_profile.json mcr.microsoft.com/playwright:v1.58.2-noble /bin/bash
```

`seccomp_profile.json` is needed to run Chromium with sandbox. This is a default Docker seccomp profile with extra user namespace cloning permissions:

```json
{
  "comment": "Allow create user namespaces",
  "names": ["clone", "setns", "unshare"],
  "action": "SCMP_ACT_ALLOW",
  "args": [],
  "includes": {},
  "excludes": {}
}
```

---

## Recommended Docker Configuration

When running Playwright in Docker, the following configuration is recommended:

- Using `--init` Docker flag is recommended to avoid special treatment for processes with PID=1. This is a common reason for zombie processes.
- Using `--ipc=host` is recommended when using Chromium. Without it, Chromium can run out of memory and crash. Learn more about this option in Docker docs.
- If seeing weird errors when launching Chromium, try running your container with `docker run --cap-add=SYS_ADMIN` when developing locally.

---

## Using on CI

See the [Continuous Integration guides](ci.md) for sample configs.

---

## Remote Connection

You can run Playwright Server in Docker while keeping your tests running on the host system or another machine. This is useful for running tests on unsupported Linux distributions or remote execution scenarios.

### Running the Playwright Server

Start the Playwright Server in Docker:

```bash
docker run -p 3000:3000 --rm --init -it --workdir /home/pwuser --user pwuser mcr.microsoft.com/playwright:v1.58.2-noble /bin/sh -c "npx -y playwright@1.58.2 run-server --port 3000 --host 0.0.0.0"
```

### Connecting to the Server

There are two ways to connect to the remote Playwright server:

Using environment variable with `@playwright/test`:

```bash
PW_TEST_CONNECT_WS_ENDPOINT=ws://127.0.0.1:3000/ npx playwright test
```

Using the `browserType.connect()` API for other applications:

```ts
const browser = await playwright['chromium'].connect('ws://127.0.0.1:3000/');
```

### Network Configuration

If you need to access local servers from within the Docker container:

```bash
docker run --add-host=hostmachine:host-gateway -p 3000:3000 --rm --init -it --workdir /home/pwuser --user pwuser mcr.microsoft.com/playwright:v1.58.2-noble /bin/sh -c "npx -y playwright@1.58.2 run-server --port 3000 --host 0.0.0.0"
```

This makes `hostmachine` point to the host's localhost. Your tests should use `hostmachine` instead of `localhost` when accessing local servers.

> **Note:** When running tests remotely, ensure the Playwright version in your tests matches the version running in the Docker container.

---

## Connecting using noVNC and GitHub Codespaces

For Docker and GitHub Codespaces environments, you can view and generate tests using the noVNC viewer built into the Docker image. In order for the VNC webviewer to be accessible outside of the container, you can enable the `desktop-lite` feature and specify the `webPort` in your `.devcontainer/devcontainer.json` file:

```json
{
  "image": "mcr.microsoft.com/playwright:v1.57.0",
  "forwardPorts": [6080],
  "features": {
    "desktop-lite": {
      "webPort": "6080"
    }
  }
}
```

Once this is enabled you can open the port specified in a new browser tab and you will have access to the noVNC web viewer. This will enable you to record tests, pick selectors, and use codegen directly on your container.

---

## Image tags

See all available image tags. We currently publish images with the following tags:

- `:v1.58.2` — Playwright v1.58.2 release docker image based on Ubuntu 24.04 LTS (Noble Numbat)
- `:v1.58.2-noble` — Playwright v1.58.2 release docker image based on Ubuntu 24.04 LTS (Noble Numbat)
- `:v1.58.2-jammy` — Playwright v1.58.2 release docker image based on Ubuntu 22.04 LTS (Jammy Jellyfish)

> **Note:** It is recommended to always pin your Docker image to a specific version if possible. If the Playwright version in your Docker image does not match the version in your project/tests, Playwright will be unable to locate browser executables.

---

## Base images

We currently publish images based on the following Ubuntu versions:

- Ubuntu 24.04 LTS (Noble Numbat) — image tags include `noble`
- Ubuntu 22.04 LTS (Jammy Jellyfish) — image tags include `jammy`

### Alpine

Browser builds for Firefox and WebKit are built for the glibc library. Alpine Linux and other distributions that are based on the musl standard library are not supported.

---

## Build your own image

To run Playwright inside Docker, you need to have Node.js, Playwright browsers and browser system dependencies installed. See the following Dockerfile:

```dockerfile
FROM node:20-bookworm
RUN npx -y playwright@1.58.2 install --with-deps
```
