import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin", "cyrillic"],
  variable: "--font-montserrat",
});

export const metadata: Metadata = {
  title: "Название компании",
  description: "Ремонт и сборка компьютеров и серверов",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jivoWidgetId = process.env.NEXT_PUBLIC_JIVO_WIDGET_ID;

  return (
    <html lang="ru">
      <body className={`${montserrat.variable} bg-background font-sans text-copy antialiased`}>
        {children}
        {jivoWidgetId ? (
          <Script
            src={`//code.jivo.ru/widget/${jivoWidgetId}`}
            strategy="afterInteractive"
          />
        ) : null}
      </body>
    </html>
  );
}
