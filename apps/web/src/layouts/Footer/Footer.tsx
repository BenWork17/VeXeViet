export function Footer() {
  return (
    <footer className="no-print border-t border-border bg-muted/50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} VeXeViet. All rights reserved.
          </div>
          
          <div className="flex space-x-6 text-sm text-muted-foreground">
            <a href="/about" className="hover:text-primary transition-colors">About Us</a>
            <a href="/contact" className="hover:text-primary transition-colors">Contact</a>
            <a href="/terms" className="hover:text-primary transition-colors">Terms of Service</a>
            <a href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
