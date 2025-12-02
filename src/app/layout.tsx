import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "GlucoIn - Deteksi Dini Diabetes",
  description: "Platform website untuk deteksi dini diabetes dan menjaga kesehatan Anda",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body
        className={`${nunito.variable} font-nunito antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
