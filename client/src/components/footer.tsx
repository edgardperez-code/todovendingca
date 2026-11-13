import { EnlaceInterno, prefiereMenosMovimiento } from "@/lib/navegacion";
import { TodoWebBadge } from "./todoweb-badge";
import { Icono } from "@/components/vitrina/iconos";
import { MarcaContenido } from "@/components/vitrina/logo";
import { Ola } from "@/components/vitrina/ola";

// Pie del diseño Vitrina (docs/rediseno-vitrina.md): la ola de marca y debajo
// el gabinete oscuro. Es oscuro en los dos temas, por eso la insignia de
// TodoWeb Digital va siempre en su versión "oscuro".

const navLinks = [
  { href: "/#inicio", label: "Inicio" },
  { href: "/#nosotros", label: "Nosotros" },
  { href: "/#servicios", label: "Servicios" },
  { href: "/#ubicaciones", label: "Ubicaciones" },
  { href: "/#faq", label: "FAQ" },
  { href: "/#contacto", label: "Contacto" },
  // Pagina estatica servida por Express (no es ruta de React): <a> normal.
  { href: "/cafe-oriente", label: "Café Oriente", external: true },
  { href: "/maquinas-expendedoras-lecheria", label: "Vending en Lechería" },
  { href: "/vending-para-empresas", label: "Vending para Empresas" },
  { href: "/vending-gimnasios", label: "Vending para Gimnasios" },
  { href: "/gift-card", label: "Gift Cards Todo Vending" },
];

interface FooterProps {
  /** Color de fondo de lo último que hay antes del pie (por defecto, papel):
      es la mitad de arriba de la ola. Ej.: "var(--papel2)". */
  desde?: string;
}

export function Footer({ desde }: FooterProps = {}) {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: prefiereMenosMovimiento() ? "auto" : "smooth" });
  };

  return (
    <>
      <Ola variante="pie" desde={desde} />
      <footer className="v-pie v-oscuro" data-testid="footer">
        <h2 className="sr-only">Pie de página</h2>
        <div className="v-cont">
          {/* Pie principal */}
          <div className="v-pie__g">
            {/* Marca */}
            <div>
              {/* Igual que el logo del header: "/" funciona desde cualquier pagina
                  ("#inicio" solo servia estando ya en el home). */}
              <EnlaceInterno
                href="/"
                className="v-marca"
                aria-label="Todo Vending CA, inicio"
                data-testid="link-footer-logo"
              >
                <MarcaContenido />
              </EnlaceInterno>
              <p>
                Tu solución integral en máquinas expendedoras. Tecnología, servicio y conveniencia en un solo lugar.
              </p>
              <div className="v-pie__redes">
                <a
                  href="https://wa.me/584146164177?text=Hola%2C%20quiero%20una%20m%C3%A1quina%20expendedora%20para%20mi%20negocio"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Escribir por WhatsApp"
                  data-testid="link-footer-whatsapp"
                >
                  <Icono nombre="whatsapp" />
                </a>
                <a
                  href="https://instagram.com/todovendingca"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  data-testid="link-footer-instagram"
                >
                  <Icono nombre="instagram" />
                </a>
                <a
                  href="https://tiktok.com/@todo.vending"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="TikTok"
                  data-testid="link-footer-tiktok"
                >
                  <Icono nombre="tiktok" />
                </a>
              </div>
            </div>

            {/* Enlaces */}
            <nav aria-label="Enlaces del pie">
              <h3 className="v-pie__tit">Enlaces</h3>
              <ul>
                {navLinks.map((link) => {
                  const Enlace = "external" in link && link.external ? "a" : EnlaceInterno;
                  return (
                    <li key={link.href}>
                      <Enlace href={link.href} data-testid={`link-footer-${link.label.toLowerCase()}`}>
                        {link.label}
                      </Enlace>
                    </li>
                  );
                })}
              </ul>
            </nav>

            {/* Servicios */}
            <div>
              <h3 className="v-pie__tit">Servicios</h3>
              <ul>
                <li>Máquinas de Snacks</li>
                <li>Máquinas de Bebidas</li>
                <li>Máquinas de Café</li>
                <li>Instalación Gratuita</li>
                <li>Mantenimiento Técnico</li>
                <li>Reposición de Inventario</li>
              </ul>
            </div>

            {/* Contacto */}
            <div>
              <h3 className="v-pie__tit">Contacto</h3>
              <ul className="v-pie__c">
                <li>
                  <Icono nombre="tel" />
                  <a href="tel:+584146164177">+58 414-616-4177</a>
                </li>
                <li>
                  <Icono nombre="correo" />
                  <a href="mailto:todovendingca@gmail.com">todovendingca@gmail.com</a>
                </li>
                <li>
                  <Icono nombre="pin" />
                  <a href="https://maps.app.goo.gl/JuHxKWCBBZS8tYwS9" target="_blank" rel="noopener noreferrer">
                    Centro Comercial Venezuela, Local 11
                    <br />
                    Calle Nueva Esparta, Lechería, Anzoátegui
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Franja inferior */}
          <div className="v-pie__b">
            <p>© {new Date().getFullYear()} Todo Vending, C.A. Todos los derechos reservados.</p>
            <button
              type="button"
              className="v-icb"
              onClick={scrollToTop}
              aria-label="Volver arriba"
              data-testid="button-scroll-top"
            >
              <Icono nombre="arriba" />
            </button>
          </div>

          {/* Insignia TodoWeb Digital */}
          <div className="v-pie__tw">
            <TodoWebBadge tema="oscuro" />
          </div>
        </div>
      </footer>
    </>
  );
}
