import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "./contexts/AppContext";
import { AppHeader } from "./components/AppHeader";
import { AppSnackbar } from "./components/AppSnackbar";

export const metadata: Metadata = {
  title: "SBOM Vulnerability Scanner",
  description: "SBOM脆弱性スキャナー - セキュリティ管理ツール",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body style={{ margin: 0, padding: 0 }}>
        <AppProvider>
          <AppHeader />
          <main>{children}</main>
          <AppSnackbar />
        </AppProvider>
      </body>
    </html>
  );
}
