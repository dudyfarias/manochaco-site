import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://manochaco.com.br"),
  title: {
    default: "Clube Atlético Manochaco",
    template: "%s | CA Manochaco",
  },
  description:
    "Portal oficial do Clube Atlético Manochaco: história, elenco, estatísticas, jogos, fotos, títulos e patrocínio.",
  openGraph: {
    title: "Clube Atlético Manochaco",
    description:
      "Preto e dourado desde 2014. História, estatísticas, fotos e bastidores do CA Manochaco.",
    images: ["/team/hero-home.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
