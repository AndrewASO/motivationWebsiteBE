"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GPT = void 0;
const dotenv_1 = require("dotenv");
const openai_1 = __importDefault(require("openai"));
// Load environment variables
(0, dotenv_1.config)();
// Ensure OPENAI_API_KEY exists or throw an error
if (!process.env.OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY is not defined in your environment variables.');
}
const clientOptions = {
    apiKey: process.env.OPENAI_API_KEY,
};
const openai = new openai_1.default(clientOptions);
class GPT {
    sendMessage(userMessage) {
        return __awaiter(this, void 0, void 0, function* () {
            const messages = [
                { role: "system", content: "You are a helpful assistant.", name: "System" },
                { role: "user", content: userMessage, name: "User" }
            ];
            const completion = yield openai.chat.completions.create({
                messages: messages,
                model: "gpt-3.5-turbo",
            });
            return completion.choices[0].message.content;
        });
    }
}
exports.GPT = GPT;
