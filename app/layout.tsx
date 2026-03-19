import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Image Background Remover — Free AI Background Eraser",
  description: "Remove image backgrounds instantly with AI. Free online tool, no signup required. Download transparent PNG in seconds.",
  openGraph: {
    title: "Image Background Remover — Free AI Background Eraser",
    description: "Remove image backgrounds instantly with AI. Free online tool, no signup required.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={geist.className}>{children}</body>
    </html>
  );
}
