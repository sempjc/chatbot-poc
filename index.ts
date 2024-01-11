import OpenAI from "openai";
import * as readline from "readline/promises";
import { OpenAiAssistant } from "./assistant-openai";
import dotenv from "dotenv";
import { AssistantCreateParams } from "openai/resources/beta/assistants/assistants";
dotenv.config();

const GREETING_MSG = "Hi I'm agent April, how can I help you today?";
const GOODBYE_MSG = "Goodbye!";
const USER__MSG = "You say: ";
const AGENT__MSG = "Agent April say: ";
const WAITING_RESPONSE_MSG = "Waiting for response...";
const newAssistantParams: AssistantCreateParams = {
  name: "April",
  instructions:
    "You are a VIP Security Manager, you role is to collect Intel and report on security threats.",
  model: "gpt-4",
  tools: [
    // {
    //   type: "function",
    //   function: {
    //     name: "getCurrentWeather",
    //     description: "Get the current weather",
    //     parameters: {
    //       type: "object",
    //       properties: {
    //         location: {
    //           type: "string",
    //           description: "The location to get the weather for",
    //           unit: { type: "string", enum: ["C", "F"] },
    //         },
    //       },
    //       required: ["location"],
    //     },
    //   },
    // },
    {
      type: "function",
      function: {
        name: "getNews",
        description: "Get the latest news",
        parameters: {
          type: "object",
          properties: {
            query: {
              type: "string",
              description: "the query to search for",
            },
          },
          required: ["query"],
        },
      },
    },
  ],
};

(async () => {
  const rl = createReadLineCLient();
  const openai = createOpenAIClient(process.env.OPENAI_API_KEY!);
  const assistant = await createAssistant(openai);
  print(GREETING_MSG + "\n");
  rl.setPrompt(USER__MSG);
  rl.prompt();
  processInput(rl, assistant);
})();

function processInput(rl: readline.Interface, assistant: OpenAiAssistant) {
  rl.on("line", async (line) => {
    switch (line.toLowerCase().trim()) {
      case "exit":
        print(GOODBYE_MSG);
        rl.close();
        break;
      default:
        await assistant.sendMessage(line);
        print(WAITING_RESPONSE_MSG);
        const response = await assistant.getMessages();
        response.data[0].content.forEach((content) => {
          if (content.type === "text") {
            print(`${AGENT__MSG}: ${content.text.value} \n`);
          }
        });
        rl.prompt();
    }
  });
}

function print(message: string) {
  console.log(message);
}

function createOpenAIClient(apiKey: string): OpenAI {
  if (!apiKey) throw new Error("Missing environment variables");
  return new OpenAI({ apiKey });
}

function createReadLineCLient(): readline.Interface {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: true,
  });
}

async function createAssistant(openai: OpenAI): Promise<OpenAiAssistant> {
  const assistant = new OpenAiAssistant(openai);
  await assistant.newAssistant(newAssistantParams);
  await assistant.newThread();
  await assistant.run();
  return assistant;
}
