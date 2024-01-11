import { TextSummarizationPOC, htmlToMarkdown } from "../pocs";
import { describe, it, expect } from "vitest";
import { openAiMain } from "../openai";
import { BingSearch } from "../poc-web-search-service/search-web";
import dotenv from "dotenv";
import { Puppeteer } from "puppeteer";
import { PuppeteerWebScrappingService } from "../poc-web-scraping-service/scraping-service";
import { AzureAILanguageServices } from "../poc-sumarization-service/summarizatioon-services";
import { webcrypto } from "crypto";
dotenv.config();

// describe("bingSearchPOC", () => {
//   it("should return a response", async () => {
//     const response = await bingSearchPOC();
//     console.log(response);
//     expect(response).toBeDefined();
//   });
// });

// describe("html to markdown", () => {
//   it("should parse html to markdown", () => {
//     const fs = require("fs");
//     const htmlTest = fs.readFileSync("./original.html", "utf8");
//     const result = htmlToMarkdown(htmlTest);
//     // console.log(result);

//     const resultSize = Buffer.byteLength(result, "utf8") / 1024;
//     const htmlSize = Buffer.byteLength(htmlTest, "utf8") / 1024;
//     // console.log("Size before convertion:", htmlSize);
//     // console.log("Size after convertion:", resultSize);

//     fs.writeFile("result.md", result, function (err: any) {
//       if (err) return console.log(err);
//       console.log("File saved");
//     });

//     expect(result).toBeDefined();
//   });
// });

// describe("should summarize text", () => {
//   it("should summarize text", async () => {
//     const fs = require("fs");
//     const result = await TextSummarizationPOC().summarize("./result.md");
//     console.log("from test result", result);

//     fs.writeFile("result-summarized.md", result, function (err: any) {
//       if (err) return console.log(err);
//       console.log("File saved");
//     });

//     expect(result).toBeDefined();
//   }, 30000);
// });

// describe("Run chatbot", () => {
//   it("should run chatbot", async () => {
//     await openAiMain();
//   });
// });

// describe("Run Search", () => {
//   it("should run search", async () => {
//     const bingSearch = new BingSearch(
//       process.env.BING_SEARCH_API_KEY!,
//       process.env.BING_SEARCH_ENDPOINT!
//     );

//     const actual = await bingSearch.query("Azure Cognitive Services");
//     console.log(actual);
//     expect(actual).toBeDefined();
//   }, 30000);
// });

// describe("WebScraping", () => {
//   it("should run webscraping", async () => {
//     // arrange
//     const webScrapper = new PuppeteerWebScrappingService();
//     // act
//     const actual = await webScrapper.scrapWebPage(
//       "https://azure.microsoft.com/en-us/services/cognitive-services/"
//     );
//     // expect
//     expect(actual).toBeDefined();
//     console.log(actual);
//   }, 30000);
// });

// describe("WebScraping to Markdown", () => {
//   it("should run webscraping", async () => {
//     // arrange
//     const webScrapper = new PuppeteerWebScrappingService();
//     const result = await webScrapper.scrapWebPage(
//       "https://azure.microsoft.com/en-us/services/cognitive-services/"
//     );
//
//     // act
//     const actual = webScrapper.convertToMarkdown(result);
//
//     // expect
//     expect(actual).toBeDefined();
//     console.log(actual);
//   }, 30000);
// });

// describe("Summarize Web Page", () => {
//   it("should summarize web page", async () => {
//     const search = new BingSearch(
//       process.env.BING_SEARCH_API_KEY!,
//       process.env.BING_SEARCH_ENDPOINT!
//     );

//     const SummarizationService = new AzureAILanguageServices(
//       process.env.LANGUAGE_KEY!,
//       process.env.LANGUAGE_ENDPOINT!
//     );

//     const webScrapper = new PuppeteerWebScrappingService();

//     const query = "Azure Cognitive Services";

//     const searchResults = await search.query(query);

//     const webContents = await Promise.all(
//       searchResults.map(async (searchResult) => {
//         const html = await webScrapper.scrapWebPage(searchResult.url);
//         return webScrapper.convertToMarkdown(html);
//       })
//     );

//     const summary = await SummarizationService.summarize(webContents);
//     console.log(summary);
//   });
// }, 30000);
