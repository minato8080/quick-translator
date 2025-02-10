"use client";

import React from "react";
import { useNavigate } from "react-router-dom";

import { ArrowRightLeft, Book } from "lucide-react";

import { Header } from "./Header";
import { DropdownMenuItem } from "./ui/dropdown-menu";

export const SPAHeader = React.memo(
  ({ english, japanese }: { english: string; japanese: string }) => {
    const navigate = useNavigate();
    if (typeof window === undefined) return null;

    return (
      <Header english={english} japanese={japanese}>
        <DropdownMenuItem
          className="text-lg py-3 px-4 hover:bg-gray-300"
          onClick={() => {
            navigate("/pwa/translate", { replace: true });
            window.history.replaceState(null, "", "/pwa/");
          }}
        >
          <ArrowRightLeft className="mr-3 h-6 w-6" />
          <span>Translate</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="text-lg py-3 px-4 hover:bg-gray-300"
          onClick={() => {
            navigate("/pwa/vocabulary", { replace: true });
            window.history.replaceState(null, "", "/pwa/");
          }}
        >
          <Book className="mr-3 h-6 w-6" />
          <span>Vocabulary</span>
        </DropdownMenuItem>
      </Header>
    );
  }
);

SPAHeader.displayName = "Header";
export default SPAHeader;
