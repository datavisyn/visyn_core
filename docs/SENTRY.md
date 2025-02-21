# Sentry

`visyn_core` has built in support for [Sentry](https://sentry.io/), including sending frontend and backend errors without exposing the underlying DSNs.

## Getting started

First, get a DSN from either [Sentry](https://sentry.io/) or a self-hosted version. It is recommended to create a frontend and backend project, i.e. as outlined in https://docs.sentry.io/product/sentry-basics/distributed-tracing/create-new-project/. Ultimately, you will have two DSNs similar to `https://<key>@<id>.ingest.us.sentry.io/<project-id>`, which you can then use to configure the backend:

```.env
# DSN for the backend
VISYN_CORE__SENTRY__BACKEND_DSN=https://<key>@<id>.ingest.us.sentry.io/<backend-id>
# DSN for the frontend
VISYN_CORE__SENTRY__FRONTEND_DSN=https://<key>@<id>.ingest.us.sentry.io/<frontend-id>
```

## FAQ

### What if my Sentry instance is not directly accessible from the browser?

As long as the backend can directly access the Sentry instance (i.e. in k8s via `http://sentry-relay.sentry.svc.cluster.local:3000`), you can do this for both the frontend and backend.

#### Frontend

While the DSN stays the same (incl. the URL which is not directly accessible), you can set the `PROXY_TO` variable to an (internal) Sentry URL accessible from the backend like `http://sentry-relay.sentry.svc.cluster.local:3000`. The frontend will then automatically send all envelopes to the API route `/api/sentry` (instead of the original URL in the DSN), which then proxies it to the accessible URL via the `sentry_proxy_router.py`.

#### Backend

The same `PROXY_TO` applies to the backend DSN, although you can also just modify the URL part of the DSN, changing `https://<key>@<id>.ingest.us.sentry.io/<project-id>` to `http(s)://<key>@<internal-url>/<project-id>`.
