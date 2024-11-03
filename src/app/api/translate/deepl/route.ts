import { isDynamicServerError } from "next/dist/client/components/hooks-server-context";

import type { DeepLTranslateAPIResponse } from "@/types/types";

// envを使用するため動的に強制
export const dynamic = "force-dynamic";
export const runtime = "edge";

export async function POST(request: Request): Promise<Response> {
  try {
    const apiKey = process.env.DEEPL_API_KEY;
    if (!apiKey) {
      const msg = "DeepL API key is not defined.";
      console.error(msg);
      throw new Error(msg);
    }
    const apiUrl = "https://api-free.deepl.com/v2/translate";

    // URLSearchParams を使ってリクエストデータを作成
    const data = new URLSearchParams((await request.json()).params);

    // fetch リクエストの送信
    const fetchResponse = await fetch(apiUrl, {
      method: "POST",
      headers: {
        Authorization: `DeepL-Auth-Key ${apiKey}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: data.toString(),
    });

    if (!fetchResponse.ok) {
      return new Response("Failed to fetch translation.", {
        status: fetchResponse.status,
        statusText: fetchResponse.statusText,
      });
    }

    const json: DeepLTranslateAPIResponse = await fetchResponse.json();
    const result = json.translations
      .map((translation) => translation.text)
      .toString();

    return new Response(result, {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    // 動的サーバーエラーは再スローが必要
    if (isDynamicServerError(error)) {
      throw error;
    }
    // 動的サーバーエラー以外のサーバー側エラー
    return new Response(`Internal Server Error : ${error}`, { status: 500 });
  }
}
