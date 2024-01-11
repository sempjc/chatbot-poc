import {
  AnalyzeBatchActionNames,
  AzureKeyCredential,
  TextAnalysisClient,
} from "@azure/ai-language-text";
import dotenv from "dotenv";
import https from "https";
import fs from "fs";
import { NodeHtmlMarkdown } from "node-html-markdown";

dotenv.config();

export async function bingSearchPOC() {
  const BING_SEARCH_API_KEY = process.env.BING_SEARCH_API_KEY;
  const BING_SEARCH_ENDPOINT = process.env.BING_SEARCH_ENDPOINT;

  if (!BING_SEARCH_API_KEY || !BING_SEARCH_ENDPOINT) {
    throw new Error("Missing environment variables");
  }

  return await webSearchClient(
    BING_SEARCH_API_KEY,
    BING_SEARCH_ENDPOINT
  ).search("Azure Cognitive Services");
}

function webSearchClient(apiKey: string, endpoint: string) {
  return Object.freeze({
    search: async (query: string) => {
      const options = {
        hostname: endpoint,
        path: "/v7.0/search?q=" + encodeURIComponent(query),
        headers: {
          "Ocp-Apim-Subscription-Key": apiKey,
        },
      };

      const data: any = await new Promise((resolve, reject) => {
        https.get(options, (response) => {
          let body = "";
          response.on("data", (d) => {
            body += d;
          });
          response.on("end", () => {
            resolve(body);
          });
          response.on("error", (e) => {
            reject(e);
          });
        });
      });
      return JSON.parse(data);
    },
  });
}

export function htmlToMarkdown(html: string) {
  const nhm = new NodeHtmlMarkdown();
  const md = nhm.translate(html);
  return md;
}

export function TextSummarizationPOC() {
  const endpoint = process.env.LANGUAGE_ENDPOINT;
  const credential = process.env.LANGUAGE_KEY;

  if (!endpoint || !credential) {
    throw new Error("Missing environment variables");
  }

  return Object.freeze({
    summarize: async (document: string) => {
      const client = new TextAnalysisClient(
        endpoint,
        new AzureKeyCredential(credential)
      );

      const documentContent = fs.readFileSync(document, "utf8");
      const documents = [documentContent];
      const poller = await client.beginAnalyzeBatch(
        [
          {
            kind: AnalyzeBatchActionNames.AbstractiveSummarization,
            sentenceCount: 10,
          },
        ],
        documents,
        "en"
      );

      poller.onProgress(() => {
        console.log(
          `Last time the operation was updated was on: ${
            poller.getOperationState().modifiedOn
          }`
        );
      });
      console.log(
        `The operation was created on ${poller.getOperationState().createdOn}`
      );
      console.log(
        `The operation results will expire on ${
          poller.getOperationState().expiresOn
        }`
      );

      const results = await poller.pollUntilDone();
      let summaryContent = "";

      for await (const actionResult of results) {
        if (
          actionResult.kind !== AnalyzeBatchActionNames.AbstractiveSummarization
        ) {
          throw new Error(
            `Expected extractive summarization results but got: ${actionResult.kind}`
          );
        }
        if (actionResult.error) {
          const { code, message } = actionResult.error;
          throw new Error(`Unexpected error (${code}): ${message}`);
        }
        for (const result of actionResult.results) {
          console.log(`- Document ${result.id}`);
          if (result.error) {
            const { code, message } = result.error;
            throw new Error(`Unexpected error (${code}): ${message}`);
          }
          summaryContent = result.summaries
            .map((sentence) => sentence.text)
            .join("\n");

          console.log("Summary:");
          console.log(summaryContent);
        }
      }

      return summaryContent;
    },
  });
}
