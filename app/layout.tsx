import "./globals.css";
import type { Metadata } from "next";

import { AuthProvider } from "@/components/auth/AuthProvider";

export const metadata: Metadata = {
  title: "Gugudan - AI Counselor",
  description: "AI-powered counselor for emotional problems between couples",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
