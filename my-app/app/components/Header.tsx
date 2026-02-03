import Link from "next/link";
import {IconLogout} from '@tabler/icons-react';
export default function Header() {
  return (
    <header className="bordeheader w-full border-b border-gray-200 bg-white shadow-sm">
      <div className="posicionheader max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="alturaheader flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="logofuente text-2xl font-bold text-black">
            SQL Interface
          </Link>

          {/* Logout */}
          <div className="logoutposicion items-center button-logout flex gap-2">
            <IconLogout className="iconologout w-6 h-6 text-black" />
            <button className="fuentelogout text-black text-md font-medium">Logout</button>
          </div>
        </div>
      </div>
    </header>
  );
}
