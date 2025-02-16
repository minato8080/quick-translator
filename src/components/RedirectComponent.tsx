"use client";

import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export const RedirectComponent = ({ to }: { to: string }) => {
  const navigate = useNavigate();
  useEffect(() => {
    navigate(to);
  }, [navigate, to]);

  return null;
};
