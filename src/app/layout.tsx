import type { Metadata, Viewport } from "next";
import "@fontsource-variable/manrope";
import "./globals.css";
import { BottomNav, SideNav } from "@/components/BottomNav";
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
        <div className="lg:flex">
          <SideNav />
          <div className="min-h-dvh min-w-0 flex-1 pb-32 lg:pb-16">
            <div className="mx-auto w-full max-w-[1120px]">{children}</div>
          </div>
        </div>
        <BottomNav />
        <RegisterSW />
      </body>
    </html>
  );
}
