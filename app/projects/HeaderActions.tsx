"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Box, Button } from "@mui/material";
import { Search, Settings } from "lucide-react";

export const HeaderActions = () => {
  const router = useRouter();

  return (
    <Box sx={{ display: "flex", gap: 1 }}>
      <Button startIcon={<Search size={18} />} color="inherit">
        検索
      </Button>
      <Button
        startIcon={<Settings size={18} />}
        color="inherit"
        onClick={() => router.push("/settings")}
      >
        設定
      </Button>
    </Box>
  );
};
