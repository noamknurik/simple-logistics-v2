import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Simple Logistics',
  description: 'Warehouse shipment documentation — proof of what left the warehouse, searchable in seconds.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900">{children}</body>
    </html>
  );
}
