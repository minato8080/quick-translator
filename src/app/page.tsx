"use client";

import { useRouter } from "next/navigation";
// local開発用
// import Translate from "./translate/page";

export default function Home() {
  // local開発用
  // return <Translate />
  const router = useRouter();
  router.push("/translate");
  return <></>;
}
