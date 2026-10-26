# TokoKu — Company Profile & Price Catalog

Company profile website for the fashion brand **TokoKu**, which also shows its product **price catalog**.
The public site is a single scrolling page: Home (storefront) → Catalog → About Us. The **Katalog** and **About Us** menu items scroll to their sections, no login required.
Store features (simulated login, dashboard, ordering) are available through the **Masuk** (Log in) button for Administrators and Clients.

Stack: React + Vite + React Router + Tailwind, with **hardcoded data** (no backend, database, or real authentication yet).

## Team

| Name | Role |
|---|---|
| Bill Gates Padma Thang | |
| Hari Nyo | |
| Jonathan Elbert Tjandra | |
| Villbert Wizley | |

## Links

- Repository: https://github.com/billgatespadmathang/WebDevProject
- Website: https://billgatespadmathang.github.io/WebDevProject/

## Running locally

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # build output goes to dist/
npm run deploy    # build + publish dist/ to the gh-pages branch (GitHub Pages)
```

## Demo accounts

| Username | Password | Role |
|---|---|---|
| admin | admin123 | Administrator |
| budi | budi123 | Client |
| sinta | sinta123 | Client |

## Pages

| Route | Area | Content |
|---|---|---|
| `#/` | Public | **Single scrolling page:** storefront Home → Catalog → About Us |
| `#/about` | Public | Same page, automatically scrolls to the About Us (company profile) section |
| `#/katalog` | Public | Same page, automatically scrolls to the Catalog section (`?kategori=` / `?q=` to filter). The **Pesan** (Order) button → login → order form |
| `#/login` | Store | Simulated login with loading & error states |
| `#/dashboard` | Store | Admin: overview, orders, best sellers, products. Client: overview, my orders, catalog |
| `#/dashboard?view=statistik` | Store | Admin: Sales Statistics — period filter, KPIs, daily revenue chart, revenue by category, order status, best sellers |
| `#/form` | Store | Admin: add/edit product (`?id=`). Client: create an order (`?productId=`) |

The company profile content lives in `src/data/company.js`. Store logo: `public/images/logo-mark.png` (the emblem cropped from `Logo TokoKu.jpg`), used through the `src/components/Logo.jsx` component; the favicon is `public/favicon.png`. Product photos are in `public/images/products/`, with their sources and licenses in `CREDITS.md`. Data submitted through the forms is kept only in state and is lost on refresh, which is within the scope of the midterm project.
