## Oauth2-Proxy

Used to locally, manually test te behaviour of auth-reverse-proxies like ALB.

Based on the suggested docker images from the main [oauth2-proxy environment](https://github.com/oauth2-proxy/oauth2-proxy/tree/master/contrib/local-environment)

### Pre-requisites

Add this to your /etc/hosts (uncommented)

```
127.0.0.1 keycloak
127.0.0.1 oauth2-proxy
```

Credentials | admin/password
Email | admin@datavisyn.io

# Configuration

Frontend env (common env in dev, different in prod) via webpack dotenv

## LOGOUT_URL

The logout url consists of multiple redirects. First we need to perform the oauth2 proxy sign out via calling `/oauth2/sign_out`.
This sign out procedure deletes the oauth2 cookie and redirects to the open id connect provider via `rd=...`. The redirect url must be an encoded url.
In our local test case, the redirect url will then point to keycloak's openid-connect logout: `auth/realms/{realm}/protocol/openid-connect/logout`. This ensures that the oidc provider also knows that the user should be logged out to prevent automatic redirects to the app with a valid cookie.

```
?rd=http://keycloak:9080/auth/realms/master/protocol/openid-connect/logout?redirect_uri=http://localhost:4180
```

- REFRESH_URL

Backend env

```env
VISYN_CORE__SECURITY__STORE__OAUTH2_SECURITY_STORE__ENABLE=true
VISYN_CORE__SECURITY__STORE__OAUTH2_SECURITY_STORE__ACCESS_TOKEN_HEADER_NAME=x-forwarded-access-token
VISYN_CORE__SECURITY__STORE__OAUTH2_SECURITY_STORE__COOKIE_NAME=_oauth2_proxy
VISYN_CORE__SECURITY__STORE__OAUTH2_SECURITY_STORE__SIGNOUT_URL=http://localhost:4180/oauth2/sign_out?rd=http%3A%2F%2Fkeycloak%3A9080%2Fauth%2Frealms%2Fmaster%2Fprotocol%2Fopenid-connect%2Flogout%3Fredirect_uri%3Dhttp%3A%2F%2Flocalhost%3A4180

```
