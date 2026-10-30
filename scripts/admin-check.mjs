import { readFile, mkdir } from "node:fs/promises";
import { chromium } from "playwright-core";

const baseUrl = process.env.DREAMSCAPE_TEST_URL || "http://localhost:3000";
const env = await readFile(".env.local", "utf8");
const password = env.match(/^DREAMSCAPE_ADMIN_PASSWORD=(.+)$/m)?.[1]?.trim();
if (!password) throw new Error("Set DREAMSCAPE_ADMIN_PASSWORD in .env.local before running the admin check.");
const browser = await chromium.launch({ executablePath: "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe", headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const slug = `admin-check-${Date.now()}`;
const imageUrl = "https://assets.example.test/admin-check.webp";
const imageBytes = await readFile("public/wallpapers/alpine-stillness.webp");
await page.route("https://assets.example.test/**", (route) => route.fulfill(
  route.request().url().endsWith("/viewer") ? { status: 200, contentType: "text/html", body: "<html>Viewer page</html>" } : { status: 200, contentType: "image/webp", body: imageBytes }
));
let published = false;

try {
  const protectedResponse = await page.request.get(`${baseUrl}/api/admin/wallpapers`);
  if (protectedResponse.status() !== 401) throw new Error("Admin catalog was accessible without sign in.");
  await page.goto(`${baseUrl}/admin`, { waitUntil: "domcontentloaded" });
  await page.getByLabel("Admin password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.getByRole("heading", { name: "Dashboard" }).waitFor();
  await page.getByText("Cedar Morning").first().waitFor();
  await mkdir("qa", { recursive: true });
  await page.screenshot({ path: "qa/admin-desktop.png", fullPage: true });

  await page.getByRole("navigation", { name: "Admin sections" }).getByRole("button", { name: "Wallpapers" }).click();
  await page.getByRole("button", { name: "Add wallpaper" }).click();
  await page.getByLabel("Title").fill("Admin Check Wallpaper");
  await page.getByLabel("Slug").fill(slug);
  await page.getByLabel("Category").fill("Nature");
  await page.getByLabel("Description").fill("An end-to-end test image for the admin dashboard.");
  await page.getByLabel("Tags (comma-separated)").fill("test, nature");
  await page.getByLabel("Direct image URL").fill("https://assets.example.test/viewer");
  await page.getByText("This link did not load as an image.", { exact: false }).waitFor();
  await page.getByLabel("Direct image URL").fill(imageUrl);
  await page.getByText("1672 x 941 px").waitFor();
  await page.getByRole("button", { name: "Publish wallpaper" }).click();
  await page.getByText("Wallpaper published.").waitFor();
  published = true;
  await page.goto(`${baseUrl}/wallpaper/${slug}`, { waitUntil: "networkidle" });
  await page.getByRole("heading", { name: "Admin Check Wallpaper" }).waitFor();
  const image = page.locator(`img[src="${imageUrl}"]`).first();
  await image.evaluate((element) => element.decode());
  await page.getByText("Download unavailable").waitFor();
  const download = await page.request.get(`${baseUrl}/api/download/${slug}`, { maxRedirects: 0 });
  if (download.status() !== 404) throw new Error("Wallpaper without a Drive link should not be downloadable.");

  await page.goto(`${baseUrl}/admin`, { waitUntil: "domcontentloaded" });
  await page.getByRole("navigation", { name: "Admin sections" }).getByRole("button", { name: "Wallpapers" }).click();
  await page.getByRole("searchbox", { name: "Search wallpapers" }).fill(slug);
  await page.getByRole("button", { name: "Edit Admin Check Wallpaper" }).click();
  await page.getByLabel("Category").fill("Abstract");
  await page.getByLabel("Google Drive download URL (optional)").fill(imageUrl);
  await page.getByRole("button", { name: "Save changes" }).click();
  await page.getByRole("alert").getByText("Enter a valid HTTPS Google Drive URL.").waitFor();
  await page.getByLabel("Google Drive download URL (optional)").fill("https://drive.google.com/file/d/test/view");
  await page.getByRole("button", { name: "Save changes" }).click();
  await page.getByText("Wallpaper updated.").waitFor();
  const updated = await page.request.get(`${baseUrl}/wallpaper/${slug}`);
  if (!updated.ok() || !(await updated.text()).includes("Abstract")) throw new Error("Edited wallpaper did not update publicly.");
  const originalDownload = await page.request.get(`${baseUrl}/api/download/${slug}`, { maxRedirects: 0 });
  if (originalDownload.status() !== 302 || !originalDownload.headers().location?.startsWith("https://drive.google.com/")) throw new Error("Original download URL was not saved.");
  await page.getByRole("navigation", { name: "Admin sections" }).getByRole("button", { name: "Analytics" }).click();
  await page.getByRole("heading", { name: "Top wallpapers" }).waitFor();
  await page.screenshot({ path: "qa/admin-analytics-desktop.png", fullPage: true });
  const row = page.getByRole("row").filter({ hasText: "Admin Check Wallpaper" });
  if (!await row.isVisible()) throw new Error("Uploaded wallpaper missing from analytics table.");

  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: "qa/admin-analytics-mobile.png", fullPage: true });
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  if (overflow) throw new Error("Admin dashboard has horizontal overflow on mobile.");
  await page.getByRole("navigation", { name: "Admin sections" }).getByRole("button", { name: "Wallpapers" }).click();
  await page.getByRole("button", { name: "Add wallpaper" }).click();
  await page.screenshot({ path: "qa/admin-form-mobile.png", fullPage: true });
  if (await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)) throw new Error("Admin form has horizontal overflow on mobile.");
  await page.getByRole("button", { name: "Close" }).click();
  await page.getByRole("searchbox", { name: "Search wallpapers" }).fill(slug);
  page.once("dialog", (dialog) => dialog.accept());
  await page.getByRole("button", { name: "Delete Admin Check Wallpaper" }).click();
  await page.getByText("Wallpaper deleted.").waitFor();
  published = false;
  const deleted = await page.request.get(`${baseUrl}/wallpaper/${slug}`);
  if (deleted.status() !== 404) throw new Error("Deleted wallpaper remains publicly accessible.");
  console.log("Admin sign-in, publish, edit, public image, download, analytics and delete passed.");
} finally {
  if (published) {
    await page.request.post(`${baseUrl}/api/admin/wallpapers`, { multipart: { mode: "delete", slug }, headers: { Origin: baseUrl } });
  }
  await browser.close();
}
