"use client";

import React from "react";
import { useNavigate } from "react-router-dom";

import { Header } from "./Header";

export const SPAHeader = ({
  english,
  japanese,
}: {
  english: string;
  japanese: string;
}) => {
  const navigate = useNavigate();
  if (typeof window === undefined) return null;

  return (
    <Header english={english} japanese={japanese} routeFunction={navigate} />
  );
};

SPAHeader.displayName = "Header";
export default SPAHeader;
