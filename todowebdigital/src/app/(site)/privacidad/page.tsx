import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { buildMetadata } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata: Metadata = buildMetadata({
  title: "Política de privacidad",
  description: "Cómo TodoWeb Digital recoge, usa y protege los datos que nos envías a través del formulario de contacto y del sitio web.",
  path: "/privacidad",
});

export default function PrivacidadPage() {
  return (
    <section className="container-x pt-10">
      <Breadcrumbs items={[{ name: "Privacidad", path: "/privacidad" }]} />
      <h1 className="font-display mt-6 text-4xl font-extrabold text-ink-900">Política de privacidad</h1>
      <p className="mt-2 text-sm text-ink-500">Última actualización: octubre de 2026</p>
      <div className="article mt-8 max-w-3xl">
        <h2>Quién es el responsable</h2>
        <p>{site.legalName}, que opera la marca {site.name} en {site.domain}, con sede en {site.address.streetAddress}, {site.address.addressLocality}, {site.address.addressRegion}, Venezuela. Puedes escribirnos a {site.email}.</p>
        <h2>Qué datos recogemos</h2>
        <ul>
          <li><strong>Formulario de contacto:</strong> nombre, correo, teléfono, empresa, sitio web, servicio de interés, presupuesto y mensaje. Solo lo que tú escribes.</li>
          <li><strong>Datos técnicos:</strong> dirección IP y página de origen, usados únicamente para evitar envíos automatizados (spam).</li>
        </ul>
        <h2>Para qué los usamos</h2>
        <p>Para responder a tu solicitud, prepararte una cotización y, si lo pides, enviarte información sobre nuestros servicios. No vendemos ni cedemos tus datos a terceros.</p>
        <h2>Dónde se guardan</h2>
        <p>En una base de datos protegida con contraseña y cifrado en tránsito, y en nuestro correo electrónico. Los conservamos mientras exista una relación comercial o hasta que nos pidas borrarlos.</p>
        <h2>Cookies</h2>
        <p>El sitio público no usa cookies de rastreo ni publicidad. El panel de administración usa una cookie técnica de sesión solo para el personal de {site.name}.</p>
        <h2>Tus derechos</h2>
        <p>Puedes pedirnos acceder, corregir o eliminar tus datos escribiendo a {site.email}. Respondemos en un máximo de 10 días hábiles.</p>
      </div>
    </section>
  );
}
