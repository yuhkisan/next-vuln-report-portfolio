"use client";

import React from "react";
import { Snackbar, Alert } from "@mui/material";
import { useApp } from "../contexts/AppContext";

export const AppSnackbar = () => {
  const { snackbarOpen, snackbarMessage, handleCloseNotification } = useApp();

  return (
    <Snackbar
      open={snackbarOpen}
      autoHideDuration={4000}
      onClose={handleCloseNotification}
      anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
    >
      <Alert
        onClose={handleCloseNotification}
        severity="info"
        variant="filled"
        sx={{ width: "100%", boxShadow: 3 }}
      >
        {snackbarMessage}
      </Alert>
    </Snackbar>
  );
};
