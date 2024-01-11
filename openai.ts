import OpenAI from "openai";
import dotenv from "dotenv";
import { ChatCompletionMessageParam } from "openai/resources/chat/completions";

dotenv.config();
const OPENAI_MODEL = "gpt-3.5-turbo";
const SYSTEM_PROMPT: ChatCompletionMessageParam = {
  role: "system",
  content: "You are a helpful assistant.",
};

export async function openAiMain() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("Missing environment variables");
  }

  const openAiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const chat = openAiClient.chat;
  const completion = await chat.completions.create({
    messages: [SYSTEM_PROMPT],
    model: OPENAI_MODEL,
  });

  console.log(completion.choices[0]);
}
