import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { Menu, X, Phone } from "lucide-react";
import { SiInstagram, SiWhatsapp, SiTiktok } from "react-icons/si";

const navLinks = [
  { href: "#inicio", label: "Inicio" },
  { href: "#nosotros", label: "Nosotros" },
  { href: "#servicios", label: "Servicios" },
  { href: "#ubicaciones", label: "Ubicaciones" },
  { href: "#faq", label: "FAQ" },
  { href: "#contacto", label: "Contacto" },
  { href: "/cafeoriente", label: "Café Oriente", external: true },
];

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-background/95 backdrop-blur-md shadow-lg"
          : "bg-transparent"
      }`}
      data-testid="header"
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <a
            href="#inicio"
            className="flex items-center gap-2"
            data-testid="link-logo"
          >
            <div className="w-10 h-10 rounded-md bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">TV</span>
            </div>
            <div className="hidden sm:block">
              <span className="font-bold text-lg text-foreground">Todo Vending</span>
              <span className="text-primary font-semibold ml-1">CA</span>
            </div>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="px-4 py-2 text-sm font-medium text-muted-foreground transition-colors rounded-md hover-elevate"
                data-testid={`link-nav-${link.label.toLowerCase()}`}
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-2">
            <a
              href="https://instagram.com/todovendingca"
              target="_blank"
              rel="noopener noreferrer"
              data-testid="link-instagram"
            >
              <Button variant="ghost" size="icon">
                <SiInstagram className="h-5 w-5" />
              </Button>
            </a>
            <a
              href="https://tiktok.com/@todo.vending"
              target="_blank"
              rel="noopener noreferrer"
              data-testid="link-tiktok"
            >
              <Button variant="ghost" size="icon">
                <SiTiktok className="h-5 w-5" />
              </Button>
            </a>
            <ThemeToggle />
            <a
              href="https://wa.me/+584146164177"
              target="_blank"
              rel="noopener noreferrer"
              data-testid="link-whatsapp-header"
            >
              <Button className="gap-2 glow-primary">
                <SiWhatsapp className="h-4 w-4" />
                <span className="hidden xl:inline">Contactar</span>
              </Button>
            </a>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex lg:hidden items-center gap-2">
            <ThemeToggle testId="button-theme-toggle-mobile" />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              data-testid="button-mobile-menu"
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-background/98 backdrop-blur-md border-t">
          <nav className="container mx-auto px-4 py-4 flex flex-col gap-2">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="px-4 py-3 text-sm font-medium text-muted-foreground rounded-md transition-colors hover-elevate"
                onClick={() => setIsMobileMenuOpen(false)}
                data-testid={`link-mobile-${link.label.toLowerCase()}`}
              >
                {link.label}
              </a>
            ))}
            <div className="flex items-center gap-2 pt-4 border-t mt-2">
              <a
                href="https://wa.me/+584146164177"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1"
              >
                <Button className="w-full gap-2">
                  <SiWhatsapp className="h-4 w-4" />
                  WhatsApp
                </Button>
              </a>
              <a
                href="https://instagram.com/todovendingca"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline" size="icon">
                  <SiInstagram className="h-5 w-5" />
                </Button>
              </a>
              <a
                href="https://tiktok.com/@todo.vending"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline" size="icon">
                  <SiTiktok className="h-5 w-5" />
                </Button>
              </a>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
