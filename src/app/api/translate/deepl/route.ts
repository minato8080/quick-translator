import { isDynamicServerError } from "next/dist/client/components/hooks-server-context";

import { DeepLTranslateAPIRequest } from "@/types/types";
import * as deepl from "deepl-node";

export const runtime = "nodejs";

export async function POST(request: Request): Promise<Response> {
  try {
    const apiKey = process.env.DEEPL_API_KEY;
    if (!apiKey) {
      throw new Error("Google Translate API URL is not defined.");
    }
    
    const translator = new deepl.Translator(apiKey);

    const { text, source_lang, target_lang }: DeepLTranslateAPIRequest = (
      await request.json()
    ).params;

    const result = await translator.translateText(
      text,
      source_lang,
      target_lang
    );

    return new Response(JSON.stringify(result.text), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    if (isDynamicServerError(error)) {
      throw error;
    }
    // エラーが動的サーバーエラーでない場合のデフォルトのレスポンスを追加
    return new Response("Internal Server Error", { status: 500 });
  }
}
