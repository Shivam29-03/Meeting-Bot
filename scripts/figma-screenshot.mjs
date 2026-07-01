import { chromium } from "playwright";
import { mkdir } from "fs/promises";
import path from "path";

const fileKey = "pIZPGjkA6YwNmm6Tm1LYuF";
const urls = [
  `https://www.figma.com/proto/${fileKey}/harshitha-rachepalli-s-team-library?node-id=3314-2&scaling=min-zoom&content-scaling=fixed`,
  `https://www.figma.com/proto/${fileKey}/harshitha-rachepalli-s-team-library?scaling=min-zoom&content-scaling=fixed&page-id=0%3A1`,
  `https://embed.figma.com/proto/${fileKey}/harshitha-rachepalli-s-team-library?node-id=3314-2&embed-host=share`,
  `https://www.figma.com/file/${fileKey}/harshitha-rachepalli-s-team-library?node-id=3314-2`,
];

const outDir = path.join(process.cwd(), "scripts", "figma-screenshots");
await mkdir(outDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

for (let i = 0; i < urls.length; i++) {
  const url = urls[i];
  console.log(`Trying: ${url}`);
  try {
    await page.goto(url, { waitUntil: "networkidle", timeout: 90000 });
    await page.waitForTimeout(8000);

    const title = await page.title();
    const bodyText = await page.locator("body").innerText();
    console.log(`Title: ${title}`);
    console.log(`Body preview: ${bodyText.slice(0, 200).replace(/\n/g, " ")}`);

    await page.screenshot({
      path: path.join(outDir, `attempt-${i + 1}.png`),
      fullPage: true,
    });
  } catch (error) {
    console.log(`Failed: ${error}`);
  }
}

await browser.close();
console.log("Done");
