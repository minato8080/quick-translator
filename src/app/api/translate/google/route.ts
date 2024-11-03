import { isDynamicServerError } from "next/dist/client/components/hooks-server-context";

export const dynamic = 'force-dynamic'; // static by default, unless reading the request
export const runtime = "edge";

export async function GET(request: Request): Promise<Response> {
  try {
    const apiUrl = process.env.GOOGLE_TRANSLATE_API;
    if (!apiUrl) {
      const msg = "Google Translate API URL is not defined.";
      throw new Error(msg);
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
    // 動的サーバーエラーは再スローが必要
    if (isDynamicServerError(error)) {
      throw error;
    }
    // 動的サーバーエラー以外のサーバー側エラー
    return new Response("Internal Server Error", { status: 500 });
  }
}
