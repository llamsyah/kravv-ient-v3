import type { Metadata } from "next";
import {headers} from 'next/headers';
import {localeFromCookie, translate} from '@/lib/localization.mjs';
import {LocaleProvider} from './localization';
import "./globals.css";
import "./surface.css";
import "./analysis.css";
import "./analysis-report.css";

export async function generateMetadata(): Promise<Metadata> {
  const locale = localeFromCookie((await headers()).get('cookie') || '');
  return {
  title: `KRAVV-IENT | ${translate(locale, 'Investment Workspace')}`,
  description: translate(locale, 'Evidence, diligence, and human judgment in one investment workspace.'),
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = localeFromCookie((await headers()).get('cookie') || '');
  return (
    <html lang={locale}>
      <body className="antialiased"><LocaleProvider initialLocale={locale}>{children}</LocaleProvider></body>
    </html>
  );
}
