#  Learning JWT Authentication

> This project is a **learning exercise** 
---

## What this is

A Next.js + TypeScript application implementing a full client-side authentication flow using JSON Web Tokens (JWT). This is not a production authentication setup — the JWT is minted and verified entirely in the browser. The goal is to understand *how JWT authentication works* 

---

## What I'm learning

###  Covered so far

| Topic | Status | Where it lives |
|---|---|---|
| What a JWT is (header · payload · signature) |  | `lib/auth.ts` |
| `btoa` / `atob` — base64 encoding, not encryption |  | `lib/auth.ts → createJWT()` |
| Token expiry with `iat` and `exp` timestamps | | `lib/auth.ts → isTokenValid()` |
| Storing the token in a cookie (not localStorage) | `lib/auth.ts → setAuthCookie()` |
| Why cookies vs localStorage matters for middleware |  | `middleware.ts` |
| Protected routes with Next.js middleware |  | `middleware.ts` |
| Restoring session from cookie on app load |  | `context/AuthContext.tsx` |
| Client-side form validation with Zod + React Hook Form | | `app/(auth)/login/page.tsx` |
| The difference between form validation and authentication |  | — |

---

###  Up next

| Topic | Why it matters |
|---|---|
| **Real API login** — replace `reqres.in` mock with a proper POST to `/api/auth/login` | Understand what a real server actually returns and how to handle the response |
| **Registration page** — build the signup form and connect it to auth flow | Apply the same Zod + React Hook Form patterns, handle new error cases |
| **Refresh tokens** — short-lived access tokens + long-lived refresh tokens | How real apps keep users logged in without being insecure |
| **`httpOnly` cookie flag** — server sets the cookie, client JS can't read it | The production-grade defence against XSS attacks |
| **Token verification on the server** — HMAC-SHA256 signing with a secret key | Why the fake `btoa('styledkraft-frontend-secret')` signature is insecure |
| **Role-based access control (RBAC)** — `role: 'designer' | 'admin' | 'client'` in the JWT payload | Different users see different dashboards; middleware checks role before rendering |
| **Logout across tabs** — using a `BroadcastChannel` to sync logout | What happens when someone logs out in one tab but has the app open in three others |
| **Token blacklisting** — server-side revocation of valid tokens | JWTs are stateless, which means a signed-out token is still technically valid until expiry |

---

###  Concepts still to explore (later)

- OAuth 2.0 / OpenID Connect — how "Continue with Google" actually works under the hood
- Passwordless auth — magic links and OTP flows
- Session tokens vs JWTs — when to choose which
- Security headers — `Strict-Transport-Security`, `Content-Security-Policy`

---

## How the auth flow works in this app

```
User visits /
     │
     ▼
middleware.ts ──── no valid cookie? ──→ redirect to /login
     │
     │ valid cookie
     ▼
/dashboard renders
     │
     └── useAuth() reads user from AuthContext
          └── AuthContext hydrated from cookie on app load
```

**Login sequence:**

1. User submits the form → Zod validates email + password client-side
2. `onSubmit` calls `login(email)` from `AuthContext`
3. `login()` calls `createJWT(email)` → writes cookie → updates state → navigates to `/dashboard`
4. On every subsequent page load, `AuthContext`'s `useEffect` reads the cookie and restores the session

---

## Current limitations (known and intentional)

- **The JWT signature is fake.** `btoa('styledkraft-frontend-secret')` is the same string every time — anyone could forge a token. This is fine for learning; real signing happens on a server with `jsonwebtoken` or similar.
- **No real API call.** Login succeeds with any valid email/password format. A real flow would POST credentials to a server and receive a signed token back.
- **The cookie is not `httpOnly`.** This means client-side JavaScript can read it — a vulnerability to XSS. Production tokens should be set by the server with the `httpOnly` flag.

---

## Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **React Hook Form** + **Zod** — form validation
- **JWT** — manual implementation (no library) for learning purposes
- **`reqres.in`** — mock API used for early auth practice

---

## Running locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). You'll be redirected to `/login`.

Use any valid email and a password of 6+ characters to log in (no real credentials needed — the JWT is minted client-side).

---

## Good experiments to try

```bash
# 1. Delete the auth-token cookie in DevTools → Application → Cookies
#    Then navigate to /dashboard — middleware should redirect you to /login

# 2. In lib/auth.ts, change EXPIRES_IN to 10 (seconds)
#    Log in, wait 10 seconds, navigate → you'll be bounced out

# 3. Add '/profile/:path*' to the middleware matcher
#    Create app/(dashboard)/profile/page.tsx
#    You've just protected a new route
```

---

Authentication is the foundation. Everything else sits behind it.

---

* · Still learning · PRs and feedback welcome*