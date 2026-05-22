import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Frost Peptídeos — Acesso à Lista Privada',
  description:
    'Peptídeos direto de fábrica em Hong Kong. Acesse nossa lista privada com preços exclusivos para uso pessoal, profissionais da saúde e revendedores.',
  robots: 'noindex, nofollow',
  openGraph: {
    title: 'Frost Peptídeos — Lista Privada',
    description: 'Acesse peptídeos com preço de fábrica. Lista privada e limitada.',
    type: 'website',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#121212',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
