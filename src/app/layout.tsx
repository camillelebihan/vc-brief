import type { Metadata, Viewport } from "next";
import "@fontsource-variable/manrope";
import "./globals.css";
import { BottomNav } from "@/components/BottomNav";
import { RegisterSW } from "@/components/RegisterSW";

export const metadata: Metadata = {
  title: "VC Brief",
  description: "Venture, deeptech and markets, explained and sourced. Every morning at 7:45.",
  appleWebApp: { capable: true, title: "VC Brief", statusBarStyle: "default" },
};

export const viewport: Viewport = {
  themeColor: "#4352d6",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="antialiased">
      <body>
        <div className="mx-auto min-h-dvh max-w-[440px] bg-paper pb-32 shadow-[0_0_0_1px_rgba(0,0,0,0.04)]">
          {children}
        </div>
        <BottomNav />
        <RegisterSW />
      </body>
    </html>
  );
}
