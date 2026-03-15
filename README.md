# Hospital CMS Vendor Repo

This repo contains only the vendor-side product:

- `apps/control-panel`
- `apps/vendor-dashboard`
- shared packages required by those apps

It does not contain:

- `apps/api`
- `apps/web`
- `apps/agent`

## Quick Start

```bash
cp .env.example .env
docker compose --env-file .env up -d --build
```

Open:

- `http://SERVER_IP:8080/`
