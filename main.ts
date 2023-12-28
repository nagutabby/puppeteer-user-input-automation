import puppeteer from "puppeteer";

(async () => {
  const browser = await puppeteer.launch({
    headless: false, args: [
      "--force-device-scale-factor"
    ]
  });
  const page = await browser.newPage();
  await page.goto("https://tourist-information.pages.dev/locations");
  // moto g power
  const width = 412;
  const height = 823;
  const deviceScaleFactor = 2;
  await page.setViewport({
    width: Math.floor(width / deviceScaleFactor), height: Math.floor(height / deviceScaleFactor), deviceScaleFactor: 2
  });
});
