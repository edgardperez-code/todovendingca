import { useState, useEffect, useRef, type MouseEvent } from "react";
import { Link } from "wouter";
import { ThemeToggle } from "@/components/theme-toggle";
import { useCarrito } from "@/lib/carrito";
import { EnlaceInterno } from "@/lib/navegacion";
import { Icono } from "@/components/vitrina/iconos";
import { MarcaContenido } from "@/components/vitrina/logo";

// Cabecera del diseño Vitrina (docs/rediseno-vitrina.md). Los estilos están en
// index.css (.v-cabecera, .v-nav, .v-acc, .v-nav-movil): por debajo de 1240 px
// el menú pasa al botón de hamburguesa, y por debajo de 1440 px se ocultan los
// iconos de redes de la barra.

const navLinks = [
  { href: "/#inicio", label: "Inicio" },
  { href: "/#nosotros", label: "Nosotros" },
  { href: "/#servicios", label: "Servicios" },
  { href: "/#ubicaciones", label: "Ubicaciones" },
  { href: "/#faq", label: "FAQ" },
  { href: "/#contacto", label: "Contacto" },
  // Pagina estatica servida por Express (no es ruta de React): <a> normal.
  { href: "/cafe-oriente", label: "Café Oriente", external: true },
  { href: "/gift-card", label: "Gift Cards" },
];

const WHATSAPP =
  "https://wa.me/584146164177?text=Hola%2C%20quiero%20una%20m%C3%A1quina%20expendedora%20para%20mi%20negocio";
const INSTAGRAM = "https://instagram.com/todovendingca";
const TIKTOK = "https://tiktok.com/@todo.vending";

// Boton del carrito con contador. El contador solo aparece cuando el carrito
// ya se leyo de localStorage (cargado): en SSR y en el primer render del
// cliente no hay numero, asi la hidratacion coincide.
function BotonCarrito({ testId }: { testId: string }) {
  const { cargado, unidades } = useCarrito();
  const mostrarContador = cargado && unidades > 0;
  return (
    <Link
      href="/carrito"
      className="v-icb"
      aria-label={
        mostrarContador ? `Ver carrito (${unidades} ${unidades === 1 ? "unidad" : "unidades"})` : "Ver carrito"
      }
      data-testid={testId}
    >
      <Icono nombre="carrito" />
      {mostrarContador && (
        <span className="v-icb__cuenta" data-testid={`${testId}-contador`}>
          {unidades}
        </span>
      )}
    </Link>
  );
}

// "Saltar al contenido": lleva el foco al <main> de la página (todas tienen
// uno), sin depender de que tenga un id concreto.
function saltarAlContenido(evento: MouseEvent<HTMLAnchorElement>) {
  const destino = document.getElementById("contenido") ?? document.querySelector("main");
  if (!(destino instanceof HTMLElement)) return;
  evento.preventDefault();
  if (!destino.hasAttribute("tabindex")) destino.setAttribute("tabindex", "-1");
  destino.focus({ preventScroll: true });
  destino.scrollIntoView({ block: "start" });
}

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const botonMenu = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 8);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Menú móvil abierto: la página de fondo no se desplaza y Escape lo cierra.
  useEffect(() => {
    if (!isMobileMenuOpen) return;
    const raiz = document.documentElement;
    raiz.classList.add("v-menu-abierto");
    const alTeclear = (evento: KeyboardEvent) => {
      if (evento.key === "Escape") {
        setIsMobileMenuOpen(false);
        botonMenu.current?.focus();
      }
    };
    document.addEventListener("keydown", alTeclear);
    return () => {
      raiz.classList.remove("v-menu-abierto");
      document.removeEventListener("keydown", alTeclear);
    };
  }, [isMobileMenuOpen]);

  return (
    <header className={`v-cabecera${isScrolled ? " v-cabecera--baja" : ""}`} data-testid="header">
      <a className="v-salto" href="#contenido" onClick={saltarAlContenido}>
        Saltar al contenido
      </a>
      <div className="v-cont v-cabecera__fila">
        {/* Logo */}
        <EnlaceInterno href="/" className="v-marca" aria-label="Todo Vending CA, inicio" data-testid="link-logo">
          <MarcaContenido />
        </EnlaceInterno>

        {/* Navegación de escritorio */}
        <nav className="v-nav" aria-label="Principal">
          {navLinks.map((link) => {
            const Enlace = link.external ? "a" : EnlaceInterno;
            return (
              <Enlace key={link.href} href={link.href} data-testid={`link-nav-${link.label.toLowerCase()}`}>
                {link.label}
              </Enlace>
            );
          })}
        </nav>

        <div className="v-acc">
          {/* Acciones de escritorio */}
          <div className="v-acc__grupo v-acc__grupo--escritorio">
            <a
              href={INSTAGRAM}
              target="_blank"
              rel="noopener noreferrer"
              className="v-icb v-red"
              aria-label="Instagram de Todo Vending CA"
              data-testid="link-instagram"
            >
              <Icono nombre="instagram" />
            </a>
            <a
              href={TIKTOK}
              target="_blank"
              rel="noopener noreferrer"
              className="v-icb v-red"
              aria-label="TikTok de Todo Vending CA"
              data-testid="link-tiktok"
            >
              <Icono nombre="tiktok" />
            </a>
            <ThemeToggle />
            <BotonCarrito testId="link-carrito" />
          </div>

          {/* Acciones de móvil y tableta */}
          <div className="v-acc__grupo v-acc__grupo--movil">
            <ThemeToggle testId="button-theme-toggle-mobile" />
            <BotonCarrito testId="link-carrito-mobile" />
          </div>

          <a
            href={WHATSAPP}
            target="_blank"
            rel="noopener noreferrer"
            className="v-btn v-btn--t v-btn--ch"
            aria-label="Contactar por WhatsApp"
            data-testid="link-whatsapp-header"
          >
            <Icono nombre="whatsapp" />
            <span>Contactar</span>
          </a>

          <button
            ref={botonMenu}
            type="button"
            className="v-icb v-menu-btn"
            aria-expanded={isMobileMenuOpen}
            aria-controls="menu-movil"
            aria-label={isMobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            data-testid="button-mobile-menu"
          >
            <Icono nombre={isMobileMenuOpen ? "cerrar" : "menu"} />
          </button>
        </div>
      </div>

      {/* Menú móvil */}
      {isMobileMenuOpen && (
        <nav className="v-nav-movil" id="menu-movil" aria-label="Principal (móvil)">
          {navLinks.map((link) => {
            const Enlace = link.external ? "a" : EnlaceInterno;
            return (
              <Enlace
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                data-testid={`link-mobile-${link.label.toLowerCase()}`}
              >
                {link.label}
              </Enlace>
            );
          })}
          <div className="v-nav-movil__redes">
            <a href={INSTAGRAM} target="_blank" rel="noopener noreferrer">
              <Icono nombre="instagram" />
              Instagram
            </a>
            <a href={TIKTOK} target="_blank" rel="noopener noreferrer">
              <Icono nombre="tiktok" />
              TikTok
            </a>
          </div>
        </nav>
      )}
    </header>
  );
}
