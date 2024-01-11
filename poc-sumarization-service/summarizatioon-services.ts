import {
  AnalyzeBatchActionNames,
  AzureKeyCredential,
  PagedAnalyzeBatchResult,
  TextAnalysisClient,
} from "@azure/ai-language-text";

interface SummarizationService {
  summarize(texts: string[]): Promise<string>;
}

export class AzureAILanguageServices implements SummarizationService {
  private readonly textAnalizerClient: TextAnalysisClient;

  constructor(apiKey: string, endpoint: string) {
    this.textAnalizerClient = new TextAnalysisClient(
      endpoint,
      new AzureKeyCredential(apiKey)
    );
  }

  async summarize(documents: string[]): Promise<string> {
    const result = await this.analyze(documents);
    let summaryContent = "";

    for await (const actionResult of result) {
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
        // console.log(`- Document ${result.id}`);
        if (result.error) {
          const { code, message } = result.error;
          throw new Error(`Unexpected error (${code}): ${message}`);
        }
        summaryContent = result.summaries
          .map((sentence) => sentence.text)
          .join("\n");

        // console.log("Summary:");
        // console.log(summaryContent);
      }
    }

    return summaryContent;
  }

  private async analyze(documents: string[]): Promise<PagedAnalyzeBatchResult> {
    const poller = await this.textAnalizerClient.beginAnalyzeBatch(
      [
        {
          kind: AnalyzeBatchActionNames.AbstractiveSummarization,
          sentenceCount: 10,
        },
      ],
      documents,
      "en"
    );

    return await poller.pollUntilDone();
  }
}
