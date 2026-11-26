# Truck Lot Finder

A mobile-first, dark-mode US and Canada truck parking directory. Astro + Tailwind on Cloudflare Pages, data in Turso. Hosting cost: $0.

> The 30 seed stops are sample data with approximate coordinates and space counts. Verify them or replace them by importing the DOT CSV.

## 1. Create the Turso database and seed it
1. Sign up at turso.tech (free plan) and install the CLI: `curl -sSfL https://get.tur.so/install.sh | bash`
2. `turso auth login`
3. `turso db create truck-parking`
4. `turso db show truck-parking --url` (this is your `TURSO_DATABASE_URL`)
5. `turso db tokens create truck-parking` (this is your `TURSO_AUTH_TOKEN`)
6. In this project folder: `npm install`
7. Create the tables and load the 30 sample stops (the seed script runs `schema.sql` for you):
   ```
   export TURSO_DATABASE_URL="libsql://..."
   export TURSO_AUTH_TOKEN="..."
   npm run seed
   ```
   To run `schema.sql` by hand instead: `turso db shell truck-parking < schema.sql`

## 2. Import real US DOT truck parking data
1. Download the truck parking CSV from the US DOT Bureau of Transportation Statistics (data.bts.gov, search "truck parking").
2. With the two environment variables above set: `npm run import-csv -- path/to/file.csv`
3. The importer matches common header names (name, city, state, address, latitude, longitude, spaces, highway, exit). If your file uses other names, add them to `ALIASES` at the top of `scripts/import-csv.js`. Rows are inserted in batches of 500 and duplicates are skipped.

## 3. Deploy on Cloudflare Pages
1. Push this repo to GitHub.
2. Cloudflare dashboard > Workers & Pages > Create > Pages > Connect to Git, choose the repo.
3. Build settings:
   - Framework preset: Astro
   - Build command: `npm run build`
   - Build output directory: `dist`
4. Settings > Variables and Secrets (Production and Preview): add `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` (mark the token as a secret).
5. Settings > Compatibility flags: add `nodejs_compat`, then redeploy.
6. No separate backend is needed. The API routes (`/api/stops`, `/api/submit`) run on Cloudflare. If you later add a Render backend, put the same two variables in its Environment tab.

## 4. Monetization
Edit `src/config/monetization.js`:
- `ADSENSE_CLIENT_ID`: your `ca-pub-...` ID. Put your ad unit IDs in `ADSENSE_SLOTS` (`top` and `in-feed`). Ads stay hidden until both are set.
- `AFFILIATE_LINKS`: paste your PartnerStack or Impact URLs for `fuelCard`, `reserveParking` and `insurance`. Buttons stay hidden while a URL is empty.
- Set `SHOW_HOUSE_PLACEHOLDERS = true` to preview ad positions.

## 5. SEO
Submit `https://YOUR-SITE/sitemap.xml` in Google Search Console. It is generated live from Turso. Owner submissions land in the `submissions` table: `turso db shell truck-parking "SELECT * FROM submissions ORDER BY id DESC"`. To feature a lot, set `is_featured = 1` and `featured_tagline` on its row.

## Local development
Copy `.dev.vars.example` to `.dev.vars`, fill it in, then `npm run dev`.
