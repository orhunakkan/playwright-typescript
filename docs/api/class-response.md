# 📦 Playwright — Response

> **Source:** [playwright.dev/docs/api/class-response](https://playwright.dev/docs/api/class-response)

---

## ResponseResponse class represents responses which are received by page

all

## Headers

Added in: v1.15 response.allHeaders An object with all the response HTTP headers associated with this response

await response.allHeaders(); Returns Promise<Object<string, string>># body​ Added before v1.9 response.body Returns the buffer with response body

await response.body(); Returns Promise<Buffer># finished​ Added before v1.9 response.finished Waits for this response to finish, returns always null

await response.finished(); Returns Promise<null | Error># frame​ Added before v1.9 response.frame Returns the Frame that initiated this response

response.frame(); Returns Frame# from

## ServiceWorker

Added in: v1.23 response.fromServiceWorker Indicates whether this Response was fulfilled by a Service Worker's Fetch Handler (i.e. via FetchEvent.respondWith)

response.fromServiceWorker(); Returns boolean# header

## Value

Added in: v1.15 response.headerValue Returns the value of the header matching the name. The name is case-insensitive. If multiple headers have the same name (except set-cookie), they are returned as a list separated by , . For set-cookie, the \n separator is used. If no headers are found, null is returned

await response.headerValue(name); Arguments name string# Name of the header

Promise<null | string># header

## Values

Added in: v1.15 response.headerValues Returns all values of the headers matching the name, for example set-cookie. The name is case-insensitive

await response.headerValues(name); Arguments name string# Name of the header

Promise<Array<string>># headers​ Added before v1.9 response.headers An object with the response HTTP headers. The header names are lower-cased. Note that this method does not return security-related headers, including cookie-related ones. You can use response.allHeaders() for complete list of headers that include cookie information

response.headers(); Returns Object<string, string># headers

## Array

Added in: v1.15 response.headersArray An array with all the request HTTP headers associated with this response. Unlike response.allHeaders(), header names are NOT lower-cased. Headers with multiple entries, such as Set-Cookie, appear in the array multiple times

await response.headersArray(); Returns Promise<Array<Object>># name string

## Name of the header. value string Value of the header. httpVersion

Added in: v1.59 response.httpVersion Returns the http version used by the response

await response.httpVersion(); Returns Promise<string># json​ Added before v1.9 response.json Returns the JSON representation of response body. This method will throw if the response body is not parsable via JSON.parse

await response.json(); Returns Promise<Serializable># ok​ Added before v1.9 response.ok Contains a boolean stating whether the response was successful (status in the range 200-299) or not

response.ok(); Returns boolean# request​ Added before v1.9 response.request Returns the matching Request object

response.request(); Returns Request# security

## Details

Added in: v1.13 response.securityDetails Returns SSL and other security information

await response.securityDetails(); Returns Promise<null | Object># issuer string (optional) Common Name component of the Issuer field. from the certificate. This should only be used for informational purposes. Optional. protocol string (optional) The specific TLS protocol used. (e.g. TLS 1.3). Optional. subjectName string (optional) Common Name component of the Subject field from the certificate. This should only be used for informational purposes. Optional. validFrom number (optional) Unix timestamp (in seconds) specifying when this cert becomes valid. Optional. validTo number (optional) Unix timestamp (in seconds) specifying when this cert becomes invalid.

## Optional. serverAddr

Added in: v1.13 response.serverAddr Returns the IP address and port of the server

await response.serverAddr(); Returns Promise<null | Object># ip

## Address string IPv4 or IPV6 address of the server. port number status

Added before v1.9 response.status Contains the status code of the response (e.g., 200 for a success)

response.status(); Returns number# status

## Text

Added before v1.9 response.statusText Contains the status text of the response (e.g. usually an "OK" for a success)

response.statusText(); Returns string# text​ Added before v1.9 response.text Returns the text representation of response body

await response.text(); Returns Promise<string># url​ Added before v1.9 response.url Contains the URL of the response

response.url(); Returns string#
