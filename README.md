# TokoKu — Company Profile & Price Catalog

Company profile and price catalog for the fashion brand **TokoKu**, with real login and online ordering backed by a REST API and database.

The public site is a single scrolling page: Home (storefront) → Catalog → About Us, no login required. Through the **Masuk** (Log in) button, clients can register, log in, order products and track their orders, and administrators manage products, orders and sales statistics.

| Part | Folder | Stack |
|---|---|---|
| Web app (public site + admin & client dashboards) | [`web-admin/`](web-admin) | React + Vite + React Router + Tailwind |
| Backend API | [`backend/`](backend) | Express + SQLite (better-sqlite3), bcrypt + JWT |
| Mobile app | `mobile-app/` | React Native + Expo (coming in Week 12) |

## Team

| Name | Role |
|---|---|
| Bill Gates Padma Thang | |
| Hari Nyo | |
| Jonathan Elbert Tjandra | |
| Villbert Wizley | |

## Links

- Repository: https://github.com/Hari-223-3/TokoKu
- Website (GitHub Pages): https://hari-223-3.github.io/TokoKu/

> **Note:** the GitHub Pages site only contains the web app. It needs a deployed backend to load products and log in, and backend hosting is covered in **Week 13**. Until then, run both parts locally as shown below.

## Running locally

Requirements: [Node.js](https://nodejs.org/) 20 or newer. The commands below are for **Windows PowerShell**, run from the repository root.

### 1. Backend (http://localhost:3000/api)

```powershell
cd backend
npm install
Copy-Item .env.example .env   # then open .env and set JWT_SECRET to a long random string
npm run seed                  # creates backend/tokoku.db with the demo data (safe to re-run; it resets the data)
npm run dev                   # starts the API with auto-restart (use `npm start` without auto-restart)
```

Check that it runs: open http://localhost:3000/api/health. It should show `{"status":"ok", ...}`.

### 2. Web app (http://localhost:5173/TokoKu/)

Open a **second** terminal (keep the backend running):

```powershell
cd web-admin
npm install
Copy-Item .env.example .env   # VITE_API_URL=http://localhost:3000/api
npm run dev
```

Other web commands: `npm run build` (output in `web-admin/dist/`), `npm run lint`, and `npm run deploy` (build + publish to the `gh-pages` branch).

If the web app shows *"Tidak dapat terhubung ke server"*, the backend is not running or `VITE_API_URL` is wrong.

## Deploying the web app (GitHub Pages)

GitHub Pages serves the built site from the `gh-pages` branch, which `npm run deploy` creates. Do not pick `main` as the Pages source: it holds the source code, not the built site.

1. Run the deploy from the web app folder:

   ```powershell
   cd web-admin
   npm run deploy      # builds the app and pushes dist/ to the gh-pages branch
   ```

2. Only the first time (already done for this repository): on GitHub, open **Settings → Pages**, keep Source on **Deploy from a branch**, choose branch **`gh-pages`** and folder **`/ (root)`**, then click **Save**.
3. After 1–2 minutes the update is live at https://hari-223-3.github.io/TokoKu/. Run `npm run deploy` again whenever the web app changes.

The site's address must match `base: '/TokoKu/'` in `web-admin/vite.config.js`. If the repository is renamed, change `base` to the new name (capital letters included). Until the backend is hosted (Week 13), the deployed site opens, but the catalog shows *"Tidak dapat terhubung ke server"* and login does not work, because the build calls `http://localhost:3000/api`.

## Demo accounts

Created by `npm run seed`. New client accounts can also be made on the **Daftar** (Register) page at `#/daftar`.

| Username | Password | Role |
|---|---|---|
| admin | admin123 | Administrator |
| budi | budi123 | Client |
| sinta | sinta123 | Client |
| rina | rina123 | Client |
| andi | andi123 | Client |
| maya | maya123 | Client |

## API endpoints

Base URL: `http://localhost:3000/api`. Requests and responses are JSON with camelCase fields. Protected routes need the header `Authorization: Bearer <token>`. Errors always look like `{ "message": "..." }` (in Indonesian) with a 400, 401, 403, 404 or 409 status.

| Method | Endpoint | Auth | Request body | Response |
|---|---|---|---|---|
| `GET` | `/health` | No | – | `{ status: "ok", time }` |
| `POST` | `/auth/register` | No | `{ username, password, name }` | `201 { token, user }`. Always creates a **client** |
| `POST` | `/auth/login` | No | `{ username, password }` | `{ token, user }`, where `user` = `{ id, username, name, role }`. Wrong credentials → `401` |
| `GET` | `/auth/me` | Yes | – | `{ user }` (restores the session after a page refresh) |
| `GET` | `/products` | No | – | Product list. Public: active products only; with an admin token: all products |
| `GET` | `/products/:id` | No | – | One product, or `404` |
| `POST` | `/products` | Admin | `{ name, category, price, stock, estimatedDays, description?, imageUrl?, isActive? }` | `201` the new product |
| `PUT` | `/products/:id` | Admin | any of the product fields (partial update) | the updated product |
| `DELETE` | `/products/:id` | Admin | – | Hard delete, or soft delete (`isActive = false`) if the product appears in an order |
| `GET` | `/orders` | Admin | – | All orders with their items, newest first |
| `GET` | `/orders/mine` | Client | – | The logged-in client's orders |
| `POST` | `/orders` | Client | `{ items: [{ productId, qty }], shippingMethod, shippingAddress, notes? }` | `201` the new order. The server looks up prices, computes the total, order number and estimated arrival, and reduces stock in one transaction. Insufficient stock → `400` |
| `PATCH` | `/orders/:id/status` | Admin | `{ status }` (`Pending`, `Dibayar`, `Diproses`, `Dikirim`, `Selesai`) | the updated order |

Tokens expire after 1 day. Passwords are stored only as bcrypt hashes.

## Database tables

SQLite file `backend/tokoku.db` (not committed; created by `npm run seed`). The schema is in `backend/db.js` and foreign keys are enforced (`PRAGMA foreign_keys = ON`). Prices are whole rupiah (`INTEGER`) and dates are `TEXT` in `YYYY-MM-DD` format.

| Table | Column | Type | Notes |
|---|---|---|---|
| `users` | `id` | INTEGER | PRIMARY KEY, auto-increment |
| | `username` | TEXT | NOT NULL, UNIQUE (stored in lowercase) |
| | `password_hash` | TEXT | NOT NULL (bcrypt) |
| | `name` | TEXT | NOT NULL |
| | `role` | TEXT | `administrator` or `client` |
| `products` | `id` | INTEGER | PRIMARY KEY, auto-increment |
| | `name`, `category` | TEXT | NOT NULL |
| | `price` | INTEGER | > 0 (rupiah) |
| | `stock` | INTEGER | ≥ 0 |
| | `description`, `image_url` | TEXT | optional (empty string) |
| | `estimated_days` | INTEGER | > 0, delivery estimate in days |
| | `is_active` | INTEGER | 1 = shown in catalog, 0 = hidden |
| `orders` | `id` | INTEGER | PRIMARY KEY |
| | `order_number` | TEXT | UNIQUE, format `INV-YYYYMMDD-XXX` |
| | `customer_id` | INTEGER | FOREIGN KEY → `users.id` |
| | `total_amount` | INTEGER | computed by the server |
| | `status` | TEXT | `Pending`, `Dibayar`, `Diproses`, `Dikirim`, `Selesai` |
| | `shipping_method` | TEXT | `JNE Reguler`, `JNE Express`, `J&T`, `SiCepat` |
| | `shipping_address`, `notes` | TEXT | |
| | `estimated_arrival`, `created_at` | TEXT | `YYYY-MM-DD` |
| `order_items` | `id` | INTEGER | PRIMARY KEY, auto-increment |
| | `order_id` | INTEGER | FOREIGN KEY → `orders.id`, ON DELETE CASCADE |
| | `product_id` | INTEGER | FOREIGN KEY → `products.id` |
| | `product_name` | TEXT | copied when ordering |
| | `qty` | INTEGER | > 0 |
| | `price_at_purchase` | INTEGER | copied when ordering |

Relationships: one user has many orders, one order has many order items, and one product appears in many order items. `product_name` and `price_at_purchase` are copied into `order_items` on purpose, so order history does not change when a product is later renamed or repriced.

## Pages (web app)

| Route | Area | Content |
|---|---|---|
| `#/` | Public | **Single scrolling page:** storefront Home → Catalog → About Us |
| `#/about` | Public | Same page, automatically scrolls to the About Us (company profile) section |
| `#/katalog` | Public | Same page, automatically scrolls to the Catalog section (`?kategori=` / `?q=` to filter). The **Pesan** (Order) button → login → order form |
| `#/login` | Store | Login with loading & error states |
| `#/daftar` | Store | Register a new client account |
| `#/dashboard` | Store | Admin: overview, orders, best sellers, products. Client: overview, my orders, catalog |
| `#/dashboard?view=pesanan` | Store | Admin: all orders, with a dropdown to change each order's status. Client: my orders |
| `#/dashboard?view=statistik` | Store | Admin: Sales Statistics — period filter, KPIs, daily revenue chart, revenue by category, order status, best sellers |
| `#/form` | Store | Admin: add/edit product (`?id=`). Client: create an order (`?productId=`) |

The company profile content lives in `web-admin/src/data/company.js`. Store logo: `web-admin/public/images/logo-mark.png` (the emblem cropped from `web-admin/Logo TokoKu.jpg`), used through the `src/components/Logo.jsx` component; the favicon is `web-admin/public/favicon.png`. Product photos are in `web-admin/public/images/products/`, with their sources and licenses in `CREDITS.md`. The demo data (products, orders, users) lives in `backend/data/seedData.js`.
