

import { config } from 'dotenv';
import OpenAI, { ClientOptions } from "openai";

// Adjusted interface to reflect that 'name' must always be a string for user messages
interface ChatCompletionMessageParam {
  role: 'system' | 'user';
  content: string;
  name: 'System' | 'User';
}

// Load environment variables
config();

// Ensure OPENAI_API_KEY exists or throw an error
if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is not defined in your environment variables.');
}

const clientOptions: ClientOptions = {
  apiKey: process.env.OPENAI_API_KEY,
};

const openai = new OpenAI(clientOptions);

export class GPT {
  async sendMessage(userMessage: string) {
    const messages: ChatCompletionMessageParam[] = [
      { role: "system", content: "You are a helpful assistant.", name: "System" },
      { role: "user", content: userMessage, name: "User" }
    ];

    const completion = await openai.chat.completions.create({
      messages: messages,
      model: "gpt-3.5-turbo",
    });

    return completion.choices[0].message.content;
  }
}
