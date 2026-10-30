# Dreamscape HD

A Next.js wallpaper gallery with a live admin dashboard. Images are hosted externally; the site saves their URLs so new wallpapers can appear without a redeploy.

## Local setup

Requires Node.js 22 or newer.

```bash
npm install
```

Create `.env.local` with a unique password of at least 16 characters (see `.env.example`), then run:

```bash
npm run dev
```

Open `/admin` on the local URL. Local catalog and analytics data are stored in `node_modules/.cache/dreamscape-hd/`, which is separate from production data and may be removed by a clean dependency install.

## Admin dashboard

1. Sign in at `/admin` with `DREAMSCAPE_ADMIN_PASSWORD`.
2. Select **Wallpapers** > **Add wallpaper**. Enter title, category, screen type, description and optional tags. The slug is generated from the title and can be edited before publishing.
3. Upload your image to ImgBB or another image host. Copy the **direct HTTPS image URL** (for example, an `i.ibb.co/.../photo.jpg` link), not the host's viewer-page URL. Paste it into **Direct image URL**. The preview must load; image dimensions and orientation are checked before publishing. Use a stable link without automatic expiration.
4. Add a publicly accessible HTTPS Google Drive share link (`drive.google.com/...`) under **Google Drive download URL**. The download button opens that Drive link, never the image-host link. Other download hosts are rejected. If you leave it blank, the download button shows **Download unavailable** until you add one.
5. Optionally feature the wallpaper in Trending, then select **Publish wallpaper**. It appears on the public site immediately. Existing wallpapers can be edited or deleted from the list.

The direct image link is used for both the gallery preview and detail image, so a smaller hosted image is better for page speed. The 11 bundled sample wallpapers are editable through the dashboard; edits are stored as overrides and do not change source files. Images uploaded through the earlier dashboard remain readable, but new entries use external URLs.

The **Analytics** section shows actual page views, download clicks, daily activity and top wallpapers over 7, 30 or 90 days. Views are page views, not unique visitors. Tracking starts after deployment and can be inflated by repeated visits or automated traffic; no historical values are invented.

## Deploy to Netlify

Connect this repository to Netlify. `netlify.toml` runs `npm run build` and publishes the Next.js server output. In **Site configuration > Environment variables**, set `DREAMSCAPE_ADMIN_PASSWORD` to a strong unique value (at least 16 characters). Do not use the local development password in production. Optionally set `NEXT_PUBLIC_SITE_URL` to your `https://...netlify.app` URL for social preview metadata. Deploy once after adding these variables.

The live catalog and analytics are stored in site-wide Netlify Blobs; this is the small persistent key-value store needed for immediate publishing, not a separate database service. New image files are **not** stored on Netlify. The admin password is checked on the server and the session is an HTTP-only cookie. Admin API routes require authentication; write requests also check their origin. The `/admin` page is not linked from the public navigation and is marked noindex, but its URL is not secret; keep the password private.

Externally hosted images may stop displaying if the host removes the file or blocks hotlinking. If you deploy somewhere other than Netlify, the catalog and analytics storage adapter must be replaced or configured; the filesystem fallback is intended for local development only.

## Checks

```bash
npm run typecheck
npm run build
npm run test:responsive
npm run test:admin
```
