# ACME Salary Management: Frontend

React 19 + TypeScript + Vite + MUI UI for the HR Manager ("Salary Desk"), on a white and cream paper theme.

> **Status:** T3.1 done (app shell, theme, API client, routing, deploy). Employee table, detail, forms and insights follow in T3.2 to T3.6, see the backend repo's [tasks](https://github.com/KRITGYA2001/salary-backend/blob/main/docs/tasks.md).

- Requirements, design, tasks, test strategy and performance docs live in the `salary-backend` repo under `docs/`.
- Live app: http://140.238.231.135/

## Run locally

```bash
cp .env.example .env
npm install
npm run dev      # proxies /api to VITE_DEV_API_TARGET
npm test         # Vitest + Testing Library
npm run build    # type-check and production build
```

## Deploy

`./deploy.sh` runs the tests, builds, and copies `dist/` to the VM's Nginx web root using the VM values in `.env`.
