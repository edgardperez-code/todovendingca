import { Button } from "@/components/ui/button";
import { Phone, Mail, MapPin, ArrowUp } from "lucide-react";
import { SiWhatsapp, SiInstagram, SiTiktok } from "react-icons/si";

const navLinks = [
  { href: "#inicio", label: "Inicio" },
  { href: "#nosotros", label: "Nosotros" },
  { href: "#servicios", label: "Servicios" },
  { href: "#ubicaciones", label: "Ubicaciones" },
  { href: "#faq", label: "FAQ" },
  { href: "#contacto", label: "Contacto" },
];

export function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-slate-900 dark:bg-slate-950 text-white" data-testid="footer">
      <div className="container mx-auto px-4">
        {/* Main Footer */}
        <div className="py-12 md:py-16">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {/* Brand */}
            <div className="lg:col-span-1">
              <a href="#inicio" className="flex items-center gap-2 mb-4" data-testid="link-footer-logo">
                <div className="w-10 h-10 rounded-md bg-primary flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-lg">TV</span>
                </div>
                <div>
                  <span className="font-bold text-lg text-white">Todo Vending</span>
                  <span className="text-primary font-semibold ml-1">CA</span>
                </div>
              </a>
              <p className="text-slate-400 text-sm mb-4">
                Tu solucion integral en maquinas expendedoras. Tecnologia, 
                servicio y conveniencia en un solo lugar.
              </p>
              <div className="flex gap-2">
                <a
                  href="https://wa.me/+584146164177"
                  target="_blank"
                  rel="noopener noreferrer"
                  data-testid="link-footer-whatsapp"
                >
                  <Button variant="outline" size="icon" className="border-slate-700 bg-slate-800/50">
                    <SiWhatsapp className="h-4 w-4" />
                  </Button>
                </a>
                <a
                  href="https://instagram.com/todovendingca"
                  target="_blank"
                  rel="noopener noreferrer"
                  data-testid="link-footer-instagram"
                >
                  <Button variant="outline" size="icon" className="border-slate-700 bg-slate-800/50">
                    <SiInstagram className="h-4 w-4" />
                  </Button>
                </a>
                <a
                  href="https://tiktok.com/@todo.vending"
                  target="_blank"
                  rel="noopener noreferrer"
                  data-testid="link-footer-tiktok"
                >
                  <Button variant="outline" size="icon" className="border-slate-700 bg-slate-800/50">
                    <SiTiktok className="h-4 w-4" />
                  </Button>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold text-white mb-4">Enlaces</h4>
              <ul className="space-y-2">
                {navLinks.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      className="text-slate-400 text-sm transition-colors hover-elevate"
                      data-testid={`link-footer-${link.label.toLowerCase()}`}
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Services */}
            <div>
              <h4 className="font-semibold text-white mb-4">Servicios</h4>
              <ul className="space-y-2 text-sm text-slate-400">
                <li>Maquinas de Snacks</li>
                <li>Maquinas de Bebidas</li>
                <li>Maquinas de Cafe</li>
                <li>Instalacion Gratuita</li>
                <li>Mantenimiento Tecnico</li>
                <li>Reposicion de Inventario</li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-semibold text-white mb-4">Contacto</h4>
              <ul className="space-y-3">
                <li className="flex items-center gap-3 text-sm">
                  <Phone className="h-4 w-4 text-primary" />
                  <a 
                    href="tel:+584146164177" 
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    +58 414-616-4177
                  </a>
                </li>
                <li className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 text-primary" />
                  <a 
                    href="mailto:todovendingca@gmail.com" 
                    className="text-slate-400 hover:text-white transition-colors"
                  >
                    todovendingca@gmail.com
                  </a>
                </li>
                <li className="flex items-start gap-3 text-sm">
                  <MapPin className="h-4 w-4 text-primary mt-0.5" />
                  <span className="text-slate-400">
                    Lecheria, Anzoategui<br />Venezuela
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="py-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-500">
            © {new Date().getFullYear()} Todo Vending, C.A. Todos los derechos reservados.
          </p>
          <Button
            variant="outline"
            size="icon"
            onClick={scrollToTop}
            className="border-slate-700 bg-slate-800/50"
            data-testid="button-scroll-top"
          >
            <ArrowUp className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </footer>
  );
}
