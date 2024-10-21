"use client";

import {
  ArrowRightLeft,
  Menu,
  Book,
} from "lucide-react";


import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";

export const Header = () => {
  const router = useRouter();
  return (
    <div className="bg-blue-600 text-white p-4 flex justify-between items-center">
      {/* アプリケーションのタイトル */}
      <h1 className="text-2xl font-bold">Quick Translator</h1>
      <div className="flex items-center space-x-2">
        {/* ドロップダウンメニュー */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-blue-700"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {/* 翻訳画面への切り替え */}
            <DropdownMenuItem onClick={() => router.push("/translate")}>
              <ArrowRightLeft className="mr-2 h-4 w-4" />
              <span>Translate</span>
            </DropdownMenuItem>
            {/* ボキャブラリー画面への切り替え */}
            <DropdownMenuItem onClick={() => router.push("/vocabulary")}>
              <Book className="mr-2 h-4 w-4" />
              <span>Vocabulary</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
