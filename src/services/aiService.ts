import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const API_URL = "https://router.huggingface.co/fireworks-ai/inference/v1/chat/completions";
const API_KEY = process.env.HF_TOKEN;

if (!API_KEY) throw new Error("HF_TOKEN is not set in environment variables.");

const headers = {
  "Authorization": `Bearer ${API_KEY}`,
  "Content-Type": "application/json"
};

export async function queryAI(
  messages: { role: string, content: string }[],
  model = "accounts/fireworks/models/llama-v3p1-8b-instruct"
) {
  const payload = { messages, model };
  const response = await axios.post(API_URL, payload, { headers });
  return response.data.choices[0].message.content;
} 