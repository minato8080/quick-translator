"use client";

import { ArrowRightLeft, Menu, Book } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";

export const Header = ({title}: {title:string}) => {
  const router = useRouter();
  return (
    <div className="bg-blue-600 text-white p-4 flex justify-between items-center">
      {/* アプリケーションのタイトル */}
      <h1 className="text-2xl font-bold">{title}</h1>
      <div className="flex items-center space-x-2">
        {/* ドロップダウンメニュー */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="lg"
              className="text-white hover:bg-blue-700 p-3 transition-all duration-200 ease-in-out"
            >
              <Menu size={24} />
              <span className="sr-only">Menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {/* 翻訳画面への切り替え */}
            <DropdownMenuItem
              onClick={() => router.push("/translate")}
              className="text-lg py-3 px-4 hover:bg-gray-300"
            >
              <ArrowRightLeft className="mr-3 h-6 w-6" />
              <span>Translate</span>
            </DropdownMenuItem>
            {/* ボキャブラリー画面への切り替え */}
            <DropdownMenuItem
              onClick={() => router.push("/vocabulary")}
              className="text-lg py-3 px-4 hover:bg-gray-300"
            >
              <Book className="mr-3 h-6 w-6" />
              <span>Vocabulary</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
