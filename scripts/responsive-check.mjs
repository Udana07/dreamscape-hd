import { mkdir } from "node:fs/promises";
import { chromium } from "playwright-core";

const baseUrl = process.env.DREAMSCAPE_TEST_URL || "http://localhost:3000";
const browser = await chromium.launch({ executablePath: "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe", headless: true });
const output = "qa";
await mkdir(output, { recursive: true });

async function checkPage(page, path, file) {
  await page.goto(`${baseUrl}${path}`, { waitUntil: "networkidle" });
  await page.locator("img").first().waitFor({ state: "visible" });
  const brokenImages = await page.locator("img").evaluateAll(async (images) => {
    images.forEach((image) => { image.loading = "eager"; });
    await Promise.all(images.map((image) => image.decode().catch(() => undefined)));
    return images.filter((image) => !image.complete || image.naturalWidth === 0).map((image) => image.src);
  });
  if (brokenImages.length) throw new Error(`${path}: broken images: ${brokenImages.join(", ")}`);
  await page.screenshot({ path: `${output}/${file}`, fullPage: true });
  const dimensions = await page.evaluate(() => ({ viewport: window.innerWidth, page: document.documentElement.scrollWidth }));
  if (dimensions.page > dimensions.viewport) throw new Error(`${path}: horizontal overflow (${dimensions.page}px > ${dimensions.viewport}px)`);
  console.log(`${path}: ${dimensions.viewport}px viewport, ${dimensions.page}px page`);
}

try {
  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
  await checkPage(mobile, "/", "home-mobile.png");
  await checkPage(mobile, "/mobile", "gallery-mobile.png");
  await mobile.getByRole("button", { name: "Open menu" }).click();
  if (await mobile.getByRole("navigation", { name: "Mobile navigation" }).getByRole("link").count() !== 3) throw new Error("Mobile menu does not have exactly three links");
  await mobile.getByRole("button", { name: "Close menu" }).click();
  await mobile.getByRole("searchbox", { name: "Search mobile wallpapers" }).fill("flower");
  if (!await mobile.getByRole("link", { name: /Blush Anthurium/ }).isVisible()) throw new Error("Gallery search did not find the flower wallpaper");
  if (await mobile.getByText("1 wallpaper").count() !== 1) throw new Error("Gallery search did not filter to one result");
  await checkPage(mobile, "/desktop", "desktop-mobile.png");
  await checkPage(mobile, "/wallpaper/alpine-stillness", "detail-mobile.png");
  if (!await mobile.getByText("Download unavailable").isVisible()) throw new Error("Missing download state is not shown");
  await mobile.close();

  const desktop = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  await checkPage(desktop, "/", "home-desktop.png");
  await checkPage(desktop, "/mobile", "gallery-desktop.png");
  await checkPage(desktop, "/desktop", "desktop-desktop.png");
  await desktop.close();
} finally {
  await browser.close();
}
