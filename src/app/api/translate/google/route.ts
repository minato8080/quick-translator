import { isDynamicServerError } from "next/dist/client/components/hooks-server-context";

export const runtime = "nodejs";

export async function GET(request: Request): Promise<Response> {
  try {
    const apiUrl = process.env.GOOGLE_TRANSLATE_API;
    if (!apiUrl) {
      throw new Error("Google Translate API URL is not defined.");
    }
    
    const fetchResponse = await fetch(
      `${apiUrl}?${new URL(request.url).searchParams}`,
      {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    if (!fetchResponse.ok) {
      throw new Error("Failed to fetch translation");
    }

    return new Response(await fetchResponse.text(), {
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
