import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ValueIt | Live Widget prototype',
  description: 'Throwaway experiment: can the Chatbot build Widgets that teach?',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
