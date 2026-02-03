export default function Footer() {
  return (
    <footer className="gridfooter footer w-full border-t border-gray-200 bg-gray-50 mt-12">
      <div className="alturafooter max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="texcentrado text-center text-gray-600 text-sm">
          <p>&copy; {new Date().getFullYear()} SQL Interface. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
