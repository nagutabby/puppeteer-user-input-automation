import puppeteer, { KnownDevices } from "puppeteer";
import { setTimeout } from 'node:timers/promises';
import fs from "fs";

const prefectures = [
  "北海道", "青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県",
  "茨城県", "栃木県", "群馬県", "埼玉県", "千葉県", "東京都", "神奈川県",
  "新潟県", "富山県", "石川県", "福井県", "山梨県", "長野県", "岐阜県",
  "静岡県", "愛知県", "三重県", "滋賀県", "京都府", "大阪府", "兵庫県",
  "奈良県", "和歌山県", "鳥取県", "島根県", "岡山県", "広島県", "山口県",
  "徳島県", "香川県", "愛媛県", "高知県", "福岡県", "佐賀県", "長崎県",
  "熊本県", "大分県", "宮崎県", "鹿児島県", "沖縄県"
];

const baseURL = "https://tourist-information.pages.dev/locations/";

for (const prefecture of prefectures) {
  const browser = await puppeteer.launch({
    headless: false
  });
  const page = await browser.newPage();
  await page.emulate(KnownDevices["Pixel 5"]);

  await page.goto(baseURL + prefecture, { waitUntil: 'networkidle0' });

  const rawResources: string = await page.evaluate(() => {
    const resources = performance.getEntriesByType('resource');
    return JSON.stringify(resources);
  });
  const resources: PerformanceEntryList = JSON.parse(rawResources);

  const output_array_title = ["prefecture", "initiatorType", "URI", "metricType", "metricValue"];
  const output_arrays: string[][] = [];
  interface ResourceMetrics {
    redirectTime: number;
    domainLookupTime: number;
    connectingTime: number;
    responseTime: number;
    duration: number;
  }

  resources.forEach(resource => {
    const resource_metrics: ResourceMetrics = {
      redirectTime: Math.floor(resource.redirectEnd - resource.redirectStart),
      domainLookupTime: Math.floor(resource.domainLookupEnd - resource.domainLookupStart),
      connectingTime: Math.floor(resource.connectEnd - resource.connectStart),
      responseTime: resource.responseStart === 0 ? 0 : Math.floor(resource.responseEnd - resource.responseStart),
      duration: Math.floor(resource.duration)
    };
    (Object.keys(resource_metrics) as (keyof ResourceMetrics)[]).map((resource_metric) => {
      output_arrays.push([
        prefecture,
        resource.initiatorType,
        resource.name,
        resource_metric,
        String(resource_metrics[resource_metric])
      ]);
    });
  });

  const outputFile = "default.csv";

  if (!fs.existsSync(outputFile)) {
    fs.writeFileSync(outputFile, output_array_title.join(",") + "\n");
  }

  output_arrays.forEach((output_array) => {
    fs.appendFileSync(outputFile, output_array.join(",") + "\n");
  });

  await browser.close();
}
