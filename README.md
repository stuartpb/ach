# ach

[![Build Status](https://travis-ci.org/stuartpb/ach.png?branch=master)](https://travis-ci.org/stuartpb/ach)

ach is a connect/express middleware generator for setting Access-Control
headers for Cross-Origin Resource Sharing.

## What's CORS?

CORS is a set of headers you can set on the header to declare that it's OK for
content on other origins (domains) to make certain requests to your site
through the browser that would not normally be allowed (like requests with
credentials, or JSON POSTs).

[W3C Specification][Spec] [MDN documentation][MDN]

[Spec]: http://www.w3.org/TR/cors/
[MDN]: https://developer.mozilla.org/en-US/docs/HTTP/Access_control_CORS

## Does this prevent unauthorized requests to my domain?

**No.** Responding with Access-Control headers only serves as a mechanism to
communicate to user's browsers when they should *allow* sites on other domains
to make requests *from that user's browser* to your server. These sites can
already trigger simple requests to your domain from the browser: CORS only
allows more complex requests through a mechanism like XmlHttpRequest that would
otherwise be blocked by default.

This is the standard-dictated behavior for browsers: other user agents (for
instance, a request in Node.js) can make whatever requests they want, including
any value for the Origin header that they wish.

Actually *restricting* access to a server requires an authentication mechanism,
the nature of which depends on who and what you're looking to restrict access
*to*. For example, OAuth is a frequently implemented mechanism for
authenticating API consumers.

## How do I use this?

To use ach with Express 0.3.x, mount it on whatever path you want to make
available with CORS, using either `app.use([prefix])` or `app.all(route)`,
depending on when you want the middleware to run relative to Express's router.

```js
var app = require('express')();
app.use(require('ach')());
app.get(function(req,res){res.send('You can read me anywhere!')});
```

## What does it do by default / how is it configurable?

By default, ach sets the Access-Control-Allow-Origin to '*' (all servers) and
the Access-Control-Allow-Headers to 'X-Requested-With' (to allow XmlHttpRequest
to declare itself). Either of these can be overridden (these defaults are only
set when their respective options are `undefined`; notably, if you set
allowedOrigin to a different falsy value (such as `null`), you will stop any
CORS headers from being sent at all).

ach allows you to set a number of headers relevant to the control of CORS to
allow behaviors beyond the default. At runtime, ach tweaks the headers it sends
slightly to match the expected behavior by the known implementations of CORS
in practice (in other words, it polyfills to match what the browsers can
handle).

For example, if you had a CDN server with an API route that's meant to serve
requests to only your secure site, expose a non-simple header like `Link`,
and allow the DELETE method, you would do something like:

```js
var app = require('express')();
app.all('/api/*', require('ach')({
  allowOrigin: 'https://example.com',
  exposeHeaders: 'Link',
  allowMethods: 'DELETE'
}));
// etc...
```

ach recognizes option names as either JavaScript-conventional camelCase,
or as case-insensitive Header-Style-Hyphen-Separation (optionally beginning
with 'Access-Control'). In the presence of multiple equivalent options,
the camelCased names take precedence: beyond that, the precedence is
*undefined*, so don't set different values for the same option.

## Option / Header Behavior Details

### allowOrigin

The origin or origins allowed to access this resource with CORS.

This may be either an Array, a space-separated origin-list (including a single
origin), '*' (signifying any domain), or 'null' / any other falsy value (which
will prevent the setting of Access-Control headers altogether, as mentioned
above).

When a request is sent with a `Origin` header specified, its match status
against this option controls whether or not any headers will be sent.

If allowOrigin is set to *, the headers will be sent: if accessCredentials is
not a truthy value, 'Access-Control-Allow-Origin' will be sent as '*'. If
accessCredentials is a truthy value, the 'Access-Control-Allow-Origin' header
will be sent with the same value as the request's Origin header, as browsers
do not trust the '*' origin with credentials.

Otherwise, the request's Origin will be compared against the specified list of
origins (falsy values and 'null' are interpreted as an empty list). If the
passed origin matches a value of the allowOrigin list, the Access-Control
headers will be set, with Access-Control-Allow-Origin set to the value of the
request's Origin (as browser implementations do not recognize origin lists in
practice).

When Access-Control-Allow-Origin is sent with the value of the request's Origin
header, unless that Origin is the only one allowed, ach will ensure that the
response's `Vary` header includes `Origin` to inform caching systems not to
cache the response for other origins.

Note that, while allowOrigin accepts the wildcard value '*' in place of an
origin-list, listed origins *can not* use wildcards (if you wish to support
multiple domains, ports, or HTTP-and/or-HTTPS, you must explicitly specify each
origin). If you need wildcard matching for Origin, you're outside the CORS
header specification and, as such, outside the domain of problems `ach()` aims
to solve.

### allowCredentials

Whether to allow requests with credentials (such as an XmlHttpRequest with
`withCredentials` set to `true`), or (for GET requestw with credentials),
whether the client will be allowed to read the results of the request.

Setting this changes the behavior of the wildcard ('*')
Access-Control-Allow-Origin header as described above.

### exposeHeaders

A comma-separated list headers on the response to expose to the client.

The "simple response headers" `Cache-Control`, `Content-Language`,
`Content-Type`, `Expires`, `Last-Modified`, and `Pragma` are always exposed, so
this can only be used to expose other headers on the response.

### maxAge

How many seconds clients should cache these Access-Control rules for.

### allowMethods

A comma-separated list of methods to allow requests to use.

The "simple methods" `GET`, `HEAD`, and `POST` are intrinsically allowed, so
this can only be used to whitelist other HTTP methods like `PUT` and `DELETE`.

### allowHeaders

A comma-separated list of headers to allow requests to send.

The "simple headers" `Accept`, `Accept-Language`, and `Content-Language` are
intrinsically allowed, as is `Content-Type` when its value is one of
`application/x-www-form-urlencoded`, `multipart/form-data`, or `text/plain`,
so this can only be used to whitelist other headers.
