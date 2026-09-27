import assert from "node:assert/strict";
import { mkdtemp, readFile, readdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { Builder, By, Key } from "selenium-webdriver";
import firefox from "selenium-webdriver/firefox.js";

const root = path.resolve(import.meta.dirname, "..");
const version = JSON.parse(await readFile(path.join(root, "package.json"), "utf8")).version;
const addon = path.join(root, "dist", `chat-exporter-by-tom-raz-${version}-firefox.zip`);
const downloadDir = await mkdtemp(path.join(tmpdir(), "chat-exporter-firefox-downloads-"));
const prompt = "Chat Exporter QA: What is 7 + 8? Answer in one sentence.";
const sites = [
  ["Claude", "https://claude.ai/"],
  ["Gemini", "https://gemini.google.com/app"],
  ["Copilot", "https://copilot.microsoft.com/"],
  ["Perplexity", "https://www.perplexity.ai/"]
];
const options = new firefox.Options()
  .setBinary("C:\\Program Files\\Mozilla Firefox\\firefox.exe")
  .addArguments("-headless")
  .setPreference("browser.download.folderList", 2)
  .setPreference("browser.download.dir", downloadDir)
  .setPreference("browser.download.useDownloadDir", true)
  .setPreference("browser.helperApps.neverAsk.saveToDisk", "text/markdown,text/plain,application/zip");

async function widgetCount(driver) {
  return driver.executeScript("return document.querySelectorAll('#chat-exporter-widget-host').length");
}

async function waitForWidget(driver, timeout = 20000) {
  try {
    await driver.wait(async () => (await widgetCount(driver)) === 1, timeout);
    return true;
  } catch {
    return false;
  }
}

let driver;
try {
  driver = await new Builder().forBrowser("firefox").setFirefoxOptions(options).build();
  await driver.manage().window().setRect({ width: 1280, height: 800 });
  const browserVersion = (await driver.getCapabilities()).get("browserVersion");
  await driver.get("https://chatgpt.com/");
  const addonId = await driver.installAddon(addon, true);
  const preexistingTabWidget = await waitForWidget(driver);
  assert.equal(preexistingTabWidget, true, "Widget missing from a tab open before add-on install");

  const input = await driver.wait(async () => {
    const elements = await driver.findElements(By.css("#prompt-textarea,#mobile-composer-prompt"));
    for (const element of elements) if (await element.isDisplayed()) return element;
    return false;
  }, 30000);
  await input.sendKeys(prompt, Key.ENTER);
  await driver.wait(async () => await driver.executeScript(`
    const node = document.querySelector('[data-message-role="assistant"],[data-message-author-role="assistant"]');
    return !!node && !node.id.startsWith('pending-') && node.innerText.includes('15');
  `), 40000);
  const visibleTurns = await driver.executeScript(`return {
    user: document.querySelectorAll('[data-message-role="user"],[data-message-author-role="user"]').length,
    assistant: document.querySelectorAll('[data-message-role="assistant"],[data-message-author-role="assistant"]').length
  }`);
  assert.deepEqual(visibleTurns, { user: 1, assistant: 1 });

  const host = await driver.findElement(By.id("chat-exporter-widget-host"));
  await host.click();
  const screenshotPath = path.join(root, "dist", `qa-firefox-widget-${version}.png`);
  await writeFile(screenshotPath, Buffer.from(await driver.takeScreenshot(), "base64"));
  const rect = await host.getRect();
  await driver.actions().move({ x: Math.round(rect.x - 183), y: Math.round(rect.y - 82) }).click().perform();
  let downloads = [];
  await driver.wait(async () => {
    downloads = (await readdir(downloadDir)).filter((name) => /\.(?:md|txt|zip)$/i.test(name));
    return downloads.length === 1;
  }, 40000);
  const exportedFile = path.join(downloadDir, downloads[0]);
  const output = await readFile(exportedFile, "utf8");
  assert.equal((output.match(/Chat Exporter QA: What is 7 \+ 8\?/g) || []).length, 1);
  assert.equal((output.match(/7 \+ 8 = 15/g) || []).length, 1);
  assert.match(output, /\*\*Total messages:\*\* 2/);
  assert.match(output, /\*\*Completeness:\*\* Complete/);
  assert.doesNotMatch(output, /You said:|ChatGPT said:/);

  const widgetSites = [];
  for (const [service, url] of sites) {
    await driver.get(url);
    const found = await waitForWidget(driver);
    widgetSites.push({ service, found });
    assert.equal(found, true, `${service} widget missing`);
  }
  console.log(JSON.stringify({ browser: "Firefox", browserVersion, addonId, preexistingTabWidget,
    visibleTurns, exportedFile, screenshotPath, widgetSites, result: "PASS" }, null, 2));
} finally {
  if (driver) await driver.quit();
}
