import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { buildMetadata } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata: Metadata = buildMetadata({
  title: "Términos del servicio",
  description: "Condiciones generales de los servicios de diseño web, SEO, GEO e IAO de TodoWeb Digital: alcance, pagos, plazos, propiedad y garantía.",
  path: "/terminos",
});

export default function TerminosPage() {
  return (
    <section className="container-x pt-10">
      <Breadcrumbs items={[{ name: "Términos", path: "/terminos" }]} />
      <h1 className="font-display mt-6 text-4xl font-extrabold text-ink-900">Términos del servicio</h1>
      <p className="mt-2 text-sm text-ink-500">Última actualización: octubre de 2026</p>
      <div className="article mt-8 max-w-3xl">
        <h2>1. Alcance</h2>
        <p>Cada proyecto se define en una propuesta escrita que incluye páginas o secciones, funcionalidades, plazos y precio. Lo que no esté en la propuesta se cotiza por separado.</p>
        <h2>2. Precios y pagos</h2>
        <p>Los precios publicados en {site.domain} son orientativos y en dólares estadounidenses. Los proyectos de pago único se abonan 50% al iniciar y 50% al entregar. Aceptamos transferencia en bolívares a la tasa oficial del día, Zelle, Binance Pay (USDT) y tarjetas internacionales.</p>
        <h2>3. Plazos</h2>
        <p>Los plazos de entrega se cuentan desde que recibimos el contenido necesario (logo, textos base, fotos y accesos). Los retrasos en la entrega de contenido desplazan la fecha de publicación.</p>
        <h2>4. Propiedad</h2>
        <p>El dominio se registra a nombre del cliente. Al completar el pago, el cliente recibe acceso completo al panel, al hosting y al código fuente de su sitio. {site.name} puede mostrar el proyecto en su portafolio salvo acuerdo en contrario.</p>
        <h2>5. Hosting y mantenimiento</h2>
        <p>El primer año de hosting está incluido. A partir del segundo año el cliente puede renovarlo con nosotros o migrar a su propio proveedor. El mantenimiento mensual es opcional y se contrata aparte.</p>
        <h2>6. Garantía</h2>
        <p>Corregimos sin costo cualquier error de funcionamiento durante los 30 días siguientes a la publicación (60 en el plan Escala). Las posiciones en Google y las recomendaciones de la IA dependen de factores externos, por lo que se garantizan las buenas prácticas aplicadas, no una posición concreta.</p>
        <h2>7. Contacto</h2>
        <p>Para cualquier consulta sobre estos términos escribe a {site.email} o al {site.phoneDisplay}.</p>
      </div>
    </section>
  );
}
