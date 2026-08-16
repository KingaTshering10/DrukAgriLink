import type { Metadata } from "next";
import "./globals.css";
import { ChatBot } from "@/components/ChatBot";

export const metadata: Metadata = {
  title: "DrukAgriLink",
  description: "Combining Bhutan's harvests with buyers and shared transport.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
