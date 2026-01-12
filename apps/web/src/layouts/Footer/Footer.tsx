export function Footer() {
  return (
    <footer className="border-t bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-sm text-gray-600">
            © {new Date().getFullYear()} VeXeViet. All rights reserved.
          </div>
          
          <div className="flex space-x-6 text-sm text-gray-600">
            <a href="/about" className="hover:text-blue-600 transition-colors">About Us</a>
            <a href="/contact" className="hover:text-blue-600 transition-colors">Contact</a>
            <a href="/terms" className="hover:text-blue-600 transition-colors">Terms of Service</a>
            <a href="/privacy" className="hover:text-blue-600 transition-colors">Privacy Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
