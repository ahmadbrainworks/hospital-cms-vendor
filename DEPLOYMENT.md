# Hospital CMS Vendor Repo Deployment

This repo contains only the vendor-side product:

- `apps/control-panel`
- `apps/vendor-dashboard`

It does not contain:

- `apps/api`
- `apps/web`
- `apps/agent`

## 1. Clone on the vendor server

```bash
git clone <vendor-repo-url> /opt/hospital-cms-vendor
cd /opt/hospital-cms-vendor
```

## 2. Create the environment file

```bash
cp .env.example .env
```

Set at minimum:

- `VENDOR_PUBLIC_ORIGIN`
- `VENDOR_API_KEY`
- `VENDOR_PRIVATE_KEY`
- `VENDOR_PUBLIC_KEY`
- `CP_JWT_SECRET`
- `CP_REFRESH_TOKEN_SECRET`
- `CP_INITIAL_ADMIN_EMAIL`
- `CP_INITIAL_ADMIN_PASSWORD`

Example:

```env
VENDOR_PUBLIC_ORIGIN=https://vendor.example.com
```

## 3. Start the vendor stack

```bash
docker compose --env-file .env up -d --build
```

## 4. Verify

```bash
curl http://localhost:8080/health
```

Expected:

- HTTP 200
- JSON with `"service":"control-panel"`

Open:

- `http://SERVER_IP:8080/`

Log in with the seeded admin user, then create hospital registration tokens from the vendor dashboard.
