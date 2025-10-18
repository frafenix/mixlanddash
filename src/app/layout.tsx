import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Suspense } from "react";
import "../css/main.css";
import StoreProvider from "./_stores/StoreProvider";
import { StackProvider, StackTheme } from "@stackframe/stack";
import { stackApp } from "@/lib/stack";
import { Provider as TooltipProvider } from "@radix-ui/react-tooltip";
import { UserTracker } from "@/components/user-tracker";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SaaS Dashboard",
  description: "Dashboard SaaS con autenticazione Stack Auth",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="style-basic">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <StackProvider app={stackApp}>
          <StackTheme>
            <StoreProvider>
              <TooltipProvider>
                <Suspense fallback={null}>
                  <UserTracker />
                </Suspense>
                {children}
              </TooltipProvider>
            </StoreProvider>
          </StackTheme>
        </StackProvider>
      </body>
    </html>
  );
}
