import { DeepLTranslateAPIRequest } from "@/types/types";
import * as deepl from "deepl-node";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const apiKey = process.env.DEEPL_API_KEY;
  if (!apiKey) {
    throw new Error("Google Translate API URL is not defined.");
  }
  const translator = new deepl.Translator(apiKey);

  const { text, source_lang, target_lang }: DeepLTranslateAPIRequest = (
    await request.json()
  ).params;

  const result = await translator.translateText(text, source_lang, target_lang);

  return new Response(JSON.stringify(result.text), {
    headers: { "Content-Type": "application/json" },
  });
}
