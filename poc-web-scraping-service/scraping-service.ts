import puppeteer from "puppeteer";
import { NodeHtmlMarkdown } from "node-html-markdown";

interface WebScrappingService {
  scrapWebPage(url: string): Promise<string>;
  convertToMarkdown(html: string): string;
}

export class PuppeteerWebScrappingService implements WebScrappingService {
  async scrapWebPage(url: string): Promise<string> {
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    await page.goto(url);
    const html = await page.content();
    await browser.close();
    return html;
  }

  convertToMarkdown(html: string): string {
    const nhm = new NodeHtmlMarkdown();
    const md = nhm.translate(html);
    return md;
  }
}
