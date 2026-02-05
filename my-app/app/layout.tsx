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
      <body className=" flex flex-col bg-gray-50 text-black relative">
        <Header />
        <main className="max-w-7xl flex-1 w-full mx-auto px-2 xl:px-0 min-h-screen relative">

          {/* Contenido de cada página */}
          <div className='min-h-dvh grow py-15'>
          {/* BackButton: solo aparece si hay historial */}
          <BackButton />
          
          {children}
        </div>
        </main>
        <Footer />
      </body>
    </html>
  );
}
