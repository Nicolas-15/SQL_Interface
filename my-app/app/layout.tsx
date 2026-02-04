import type { Metadata } from 'next';
import './globals.css';
import Header from './components/Header';
import Footer from './components/Footer';
import BackButton from './components/BackButton';

export const metadata: Metadata = {
  title: 'SQL Interface',
  description: 'Interfaz para consultar base de datos SQL',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="min-h-screen flex flex-col bg-white text-black">
        <Header />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* BackButton: solo aparece si hay historial */}
          <BackButton />

          {/* Contenido de cada página */}
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
