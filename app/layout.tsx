import type { Metadata } from "next";
import "./globals.css";
import Providers from "./providers";
import UserMenu from "@/components/UserMenu";

export const metadata: Metadata = {
  title: "Inbox Ops Assistant",
  description: "AI Assistant for Your Inbox",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <nav className="border-b border-gray-200 bg-white">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="flex h-16 items-center justify-between">
                <h1 className="text-xl font-semibold text-gray-900">
                  Inbox Ops Assistant
                </h1>
                <UserMenu />
              </div>
            </div>
          </nav>
          {children}
        </Providers>
      </body>
    </html>
  );
}

