# ACME Salary Management: Frontend

React 19 + TypeScript + Vite + MUI UI for the HR Manager ("Salary Desk"), on a white and cream paper theme.

> **Status:** complete and deployed: employee list, detail with salary history, hire/edit/salary-change/deactivate forms, insights dashboard and CSV export.

## Screens
| Route | What it does |
|-------|--------------|
| `/employees` | Search, filter, sort and page through employees; filters live in the URL so views can be shared; Export CSV; Add employee |
| `/employees/:id` | Overview, salary history, edit, change salary, deactivate |
| `/insights` | Summary figures, average pay by country, department or job title, distribution, highest and lowest paid |

Server state uses TanStack Query (writes invalidate employee and insight queries). Field errors from the API's `details` are shown next to the inputs.

- Requirements, design, tasks, test strategy and performance docs live in the `salary-backend` repo under `docs/`.
- Live app: http://140.238.231.135/

## Run locally

```bash
cp .env.example .env
npm install
npm run dev      # proxies /api to VITE_DEV_API_TARGET
npm test         # Vitest + Testing Library, API mocked with fetch stubs
npm run typecheck
npm run build    # type-check and production build
```

## Deploy

`./deploy.sh` runs the tests, builds, and copies `dist/` to the VM's Nginx web root using the VM values in `.env`.
