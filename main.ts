import puppeteer, { KnownDevices } from "puppeteer";
import { setTimeout } from 'node:timers/promises';

const browser = await puppeteer.launch({
  headless: false
});
const page = await browser.newPage();

await page.emulate(KnownDevices["Pixel 5"]);

await page.goto("https://tourist-information.pages.dev/locations/北海道", { waitUntil: 'networkidle0' });

await page.mouse.down();
// 1ページ下にスクロールする
await page.mouse.move(0, -851);
await page.mouse.up();

await setTimeout(5000);

const rawResources: string = await page.evaluate(() => {
  const resources = performance.getEntriesByType('resource');
  return JSON.stringify(resources);
});
const resources: PerformanceEntryList = JSON.parse(rawResources);
console.log(`読み込んだリソース数: ${resources.length}`);
resources.forEach(resource => {
  console.log(`redirect time: ${Math.floor(resource.redirectEnd - resource.redirectStart)}`);
  console.log(`domain lookup time: ${Math.floor(resource.domainLookupEnd - resource.domainLookupStart)}`);
  console.log(`connecting time: ${Math.floor(resource.connectEnd - resource.connectStart)}`);
  console.log(`response time: ${resource.responseStart === 0 ? 0 : Math.floor(resource.responseEnd - resource.responseStart)}`);
  console.log(`duration: ${Math.floor(resource.duration)}`);
});
await browser.close();
