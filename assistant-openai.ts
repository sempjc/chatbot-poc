import OpenAI from "openai";
import {
  Assistant,
  AssistantCreateParams,
} from "openai/resources/beta/assistants/assistants";
import {
  ThreadMessage,
  ThreadMessagesPage,
} from "openai/resources/beta/threads/messages/messages";
import { Run } from "openai/resources/beta/threads/runs/runs";
import { Thread } from "openai/resources/beta/threads/threads";
import { AzureAILanguageServices } from "./poc-sumarization-service/summarizatioon-services";
import { PuppeteerWebScrappingService } from "./poc-web-scraping-service/scraping-service";
import { BingSearch } from "./poc-web-search-service/search-web";

export class OpenAiAssistant {
  private assistant?: Assistant;
  private thread?: Thread;
  private runs?: Run;
  private readonly openai: OpenAI;

  constructor(openai: OpenAI) {
    this.openai = openai;
  }

  async newAssistant(newAssistantParams: AssistantCreateParams): Promise<this> {
    this.assistant = await this.openai.beta.assistants.create(
      newAssistantParams
    );
    return this;
  }

  async newThread(): Promise<this> {
    this.thread = await this.openai.beta.threads.create();
    return this;
  }

  async run() {
    if (!this.thread || !this.assistant) throw new Error("Not initialized");
    if (!this.assistant.id) throw new Error("Assistant not initialized");

    this.runs = await this.openai.beta.threads.runs.create(this.thread.id, {
      assistant_id: this.assistant?.id,
      instructions: this.assistant?.instructions,
    });
    return this.runs;
  }

  async sendMessage(text: string): Promise<ThreadMessage> {
    if (!this.thread || !this.assistant) throw new Error("Not initialized");

    await this.onEvents();
    const message = await this.openai.beta.threads.messages.create(
      this.thread.id,
      {
        role: "user",
        content: text,
      }
    );
    this.run();
    return message;
  }

  async getMessages(): Promise<ThreadMessagesPage> {
    if (!this.thread) throw new Error("Thread not initialized");
    await this.onEvents();
    const messages = await this.openai.beta.threads.messages.list(
      this.thread.id,
      {
        order: "desc",
      }
    );
    return messages;
  }

  async onGetWeather() {
    return "1000 F";
  }

  private async onEvents() {
    if (!this.thread || !this.assistant) throw new Error("Not initialized");
    if (!this.runs) throw new Error("Run not initialized");

    let run: Run;

    do {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      run = await this.openai.beta.threads.runs.retrieve(
        this.thread.id,
        this.runs.id
      );

      console.log(run.status);

      if (run.status === "requires_action") {
        const toolsCall = run.required_action?.submit_tool_outputs?.tool_calls;
        const response = toolsCall
          ?.filter((event) => event.function.name === "getNews")
          .map(async (event: { function: { arguments: any }; id: any }) => {
            const { arguments: args } = event.function;
            const id = event.id;
            const data = JSON.parse(args);
            const summaryContent = new SummariWebSearch();
            const output = await summaryContent.summarizeAndSearch(data.query);
            return {
              tool_call_id: id,
              output,
            };
          });

        const results = await Promise.all(response!);

        results &&
          this.openai.beta.threads.runs.submitToolOutputs(
            this.thread!.id,
            run.id,
            { tool_outputs: results }
          );
      }
    } while (run.status != "completed");
  }
}

class SummariWebSearch {
  async summarizeAndSearch(query: string): Promise<string> {
    const search = new BingSearch(
      process.env.BING_SEARCH_API_KEY!,
      process.env.BING_SEARCH_ENDPOINT!
    );

    const summarization = new AzureAILanguageServices(
      process.env.LANGUAGE_KEY!,
      process.env.LANGUAGE_ENDPOINT!
    );

    const scrapper = new PuppeteerWebScrappingService();
    const searchResults = await search.query(query);

    const webContents = await searchResults.map(async (searchResult) => {
      const html = await scrapper.scrapWebPage(searchResult.url);
      return scrapper.convertToMarkdown(html);
    });

    const contentResult = await Promise.all(webContents);

    return await summarization.summarize(contentResult);
  }
}
