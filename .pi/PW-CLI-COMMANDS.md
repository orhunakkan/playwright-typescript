# Playwright CLI Reference

This file reflects the local `playwright-cli` help observed in this repo, not the standard `npx playwright` test runner command catalog.

Verified locally on 2026-05-12:

```bash
playwright-cli --version
# 1.59.0-alpha-1771104257000
```

---

## Basic Usage

```bash
playwright-cli <command> [args] [options]
playwright-cli -s=<session> <command> [args] [options]
```

Common examples:

```bash
playwright-cli open
playwright-cli goto https://example.com
playwright-cli snapshot
playwright-cli click <ref>
playwright-cli -s=default snapshot
```

Use `snapshot` to capture the current accessibility snapshot and obtain element refs for commands such as `click`, `fill`, `hover`, `check`, and `screenshot`.

---

## Core Commands

```text
open [url]                  open the browser
close                       close the browser
goto <url>                  navigate to a url
type <text>                 type text into editable element
click <ref> [button]        perform click on a web page
dblclick <ref> [button]     perform double click on a web page
fill <ref> <text>           fill text into editable element
drag <startRef> <endRef>    perform drag and drop between two elements
hover <ref>                 hover over element on page
select <ref> <val>          select an option in a dropdown
upload <file>               upload one or multiple files
check <ref>                 check a checkbox or radio button
uncheck <ref>               uncheck a checkbox or radio button
snapshot                    capture page snapshot to obtain element ref
eval <func> [ref]           evaluate javascript expression on page or element
dialog-accept [prompt]      accept a dialog
dialog-dismiss              dismiss a dialog
resize <w> <h>              resize the browser window
delete-data                 delete session data
```

Examples:

```bash
playwright-cli open https://example.com
playwright-cli fill e42 "search text"
playwright-cli click e43 left
playwright-cli eval "() => document.title"
playwright-cli eval "(el) => el.textContent" e12
playwright-cli resize 1440 900
```

---

## Navigation Commands

```text
go-back                     go back to the previous page
go-forward                  go forward to the next page
reload                      reload the current page
```

---

## Keyboard Commands

```text
press <key>                 press a key on the keyboard, `a`, `arrowleft`
keydown <key>               press a key down on the keyboard
keyup <key>                 press a key up on the keyboard
```

Examples:

```bash
playwright-cli press Enter
playwright-cli press ArrowLeft
playwright-cli keydown Shift
playwright-cli keyup Shift
```

---

## Mouse Commands

```text
mousemove <x> <y>           move mouse to a given position
mousedown [button]          press mouse down
mouseup [button]            press mouse up
mousewheel <dx> <dy>        scroll mouse wheel
```

Examples:

```bash
playwright-cli mousemove 300 400
playwright-cli mousedown left
playwright-cli mousewheel 0 600
```

---

## Save As Commands

```text
screenshot [ref]            screenshot of the current page or element
pdf                         save page as pdf
```

Examples:

```bash
playwright-cli screenshot
playwright-cli screenshot e12
playwright-cli pdf
```

---

## Tab Commands

```text
tab-list                    list all tabs
tab-new [url]               create a new tab
tab-close [index]           close a browser tab
tab-select <index>          select a browser tab
```

Examples:

```bash
playwright-cli tab-list
playwright-cli tab-new https://example.com
playwright-cli tab-select 1
playwright-cli tab-close 1
```

---

## Storage Commands

```text
state-load <filename>       loads browser storage (authentication) state from a file
state-save [filename]       saves the current storage (authentication) state to a file
cookie-list                 list all cookies (optionally filtered by domain/path)
cookie-get <name>           get a specific cookie by name
cookie-set <name> <value>   set a cookie with optional flags
cookie-delete <name>        delete a specific cookie
cookie-clear                clear all cookies
localstorage-list           list all localstorage key-value pairs
localstorage-get <key>      get a localstorage item by key
localstorage-set <key> <value> set a localstorage item
localstorage-delete <key>   delete a localstorage item
localstorage-clear          clear all localstorage
sessionstorage-list         list all sessionstorage key-value pairs
sessionstorage-get <key>    get a sessionstorage item by key
sessionstorage-set <key> <value> set a sessionstorage item
sessionstorage-delete <key> delete a sessionstorage item
sessionstorage-clear        clear all sessionstorage
```

Examples:

```bash
playwright-cli state-save auth-state.json
playwright-cli state-load auth-state.json
playwright-cli cookie-get session
playwright-cli cookie-set theme dark
playwright-cli localstorage-set featureFlag enabled
playwright-cli sessionstorage-clear
```

---

## Network Commands

```text
route <pattern>             mock network requests matching a url pattern
route-list                  list all active network routes
unroute [pattern]           remove routes matching a pattern (or all routes)
```

Examples:

```bash
playwright-cli route "**/api/**"
playwright-cli route-list
playwright-cli unroute "**/api/**"
playwright-cli unroute
```

---

## DevTools Commands

```text
console [min-level]         list console messages
run-code <code>             run playwright code snippet
network                     list all network requests since loading the page
tracing-start               start trace recording
tracing-stop                stop trace recording
video-start                 start video recording
video-stop                  stop video recording
show                        show browser devtools
devtools-start              show browser devtools
```

Examples:

```bash
playwright-cli console
playwright-cli console error
playwright-cli network
playwright-cli run-code "await page.locator('button').count()"
playwright-cli tracing-start
playwright-cli tracing-stop
```

---

## Install Commands

```text
install                     initialize workspace
install-browser             install browser
```

Use these to prepare the `playwright-cli` workspace and browser runtime.

---

## Browser Session Commands

```text
list                        list browser sessions
close-all                   close all browser sessions
kill-all                    forcefully kill all browser sessions (for stale/zombie processes)
```

Examples:

```bash
playwright-cli list
playwright-cli close-all
playwright-cli kill-all
```

---

## Global Options

```text
--help [command]            print help
--version                   print version
```

Examples:

```bash
playwright-cli --help
playwright-cli --help click
playwright-cli --version
```
