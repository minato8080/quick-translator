import { NextResponse } from "next/server";

import type { NextRequest } from 'next/server'

export function middleware(_request: NextRequest) {
  const res = NextResponse.next();
  res.headers.set("Cache-Control", "public, max-age=31536000, immutable");
  return res;
}

export const config = {
  matcher: "/pwa/:path*",
};
