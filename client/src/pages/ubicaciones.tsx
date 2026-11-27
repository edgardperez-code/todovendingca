import { PaginaApoyo } from "@/components/pagina-apoyo";
import { CabeceraSeccion } from "@/components/vitrina/etiqueta";
import { Icono } from "@/components/vitrina/iconos";
import { ListaConCuenta } from "@/components/vitrina/subpagina";
import { SubpageCTA } from "@/components/subpage-cta";
import { currentLocations } from "@/components/locations-section";
import { EnlaceInterno } from "@/lib/navegacion";
import { useSEO } from "@/lib/seo";
import { BUSINESS_ADDRESS, BUSINESS_MAP_URL, organizationSchema, breadcrumbSchema } from "@/lib/schema";

// Dónde están hoy las máquinas. La lista sale de currentLocations (la misma
// del inicio), así nunca se desincronizan. Zona de servicio: solo Lechería.
export default function Ubicaciones() {
  useSEO({
    title: "Ubicaciones de Nuestras Máquinas Expendedoras en Lechería | Todo Vending CA",
    description: `Dónde están hoy las máquinas de Todo Vending CA: ${currentLocations
      .map((u) => u.name)
      .join(", ")}. Trabajamos en Lechería, Anzoátegui.`,
    path: "/ubicaciones",
    jsonLd: [
      organizationSchema,
      breadcrumbSchema([
        { name: "Inicio", path: "/" },
        { name: "Ubicaciones", path: "/ubicaciones" },
      ]),
      {
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: "Ubicaciones de las máquinas de Todo Vending CA",
        numberOfItems: currentLocations.length,
        itemListElement: currentLocations.map((u, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: u.name,
          description: u.description,
        })),
      },
    ],
  });

  return (
    <PaginaApoyo
      etiqueta="Ubicaciones"
      titulo={
        <>
          Dónde están nuestras <em className="n">máquinas</em>
        </>
      }
      lead="Estas son las ubicaciones donde hoy hay máquinas de Todo Vending CA. Trabajamos en Lechería, estado Anzoátegui."
    >
      <section className="v-sec v-sec--2">
        <div className="v-cont">
          <ListaConCuenta
            etiqueta="Ubicaciones actuales"
            titulo={
              <>
                Máquinas <em>en servicio</em>
              </>
            }
            unidad="Ubicaciones"
            items={currentLocations.map((u) => ({ nombre: u.name, tipo: u.type }))}
          />
        </div>
      </section>

      <section className="v-sec">
        <div className="v-cont">
          <CabeceraSeccion
            etiqueta="Qué hay en cada una"
            titulo={
              <>
                Cada ubicación, <em className="n">a su medida</em>
              </>
            }
            lead="Los productos de cada máquina se eligen con el lugar donde está y se ajustan según lo que más se consume."
          />
          <ul className="va-grid">
            {currentLocations.map((u) => (
              <li key={u.name}>
                <article className="va-card">
                  <span className="va-chip">{u.type}</span>
                  <h3>{u.name}</h3>
                  <p>{u.description}</p>
                </article>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="v-sec v-sec--2">
        <div className="v-cont">
          <CabeceraSeccion
            etiqueta="Zona de servicio"
            titulo={
              <>
                Trabajamos en <em>Lechería</em>
              </>
            }
            lead="Por ahora instalamos máquinas en espacios de Lechería. Si tu empresa, clínica, colegio o gimnasio está en Lechería, escríbenos y coordinamos una evaluación sin compromiso."
          />
          <div className="va-grid">
            <article className="va-card">
              <Icono nombre="pin" />
              <h3>Nuestra oficina</h3>
              <p>
                {BUSINESS_ADDRESS.streetAddress}, {BUSINESS_ADDRESS.addressLocality}, {BUSINESS_ADDRESS.addressRegion}.
              </p>
              <p className="va-nota">
                <a href={BUSINESS_MAP_URL} target="_blank" rel="noopener noreferrer">
                  Ver en el mapa
                </a>
              </p>
            </article>
            <article className="va-card">
              <Icono nombre="instala" />
              <h3>¿Quieres una máquina?</h3>
              <p>La instalación es gratuita y nosotros nos encargamos de la reposición y el mantenimiento.</p>
              <p className="va-nota">
                <EnlaceInterno href="/solicitar-maquina">Solicitar una máquina</EnlaceInterno>
              </p>
            </article>
          </div>
        </div>
      </section>

      <SubpageCTA
        title="Tu espacio puede ser el próximo"
        text="Si estás en Lechería, cuéntanos sobre tu espacio y coordinamos una evaluación sin compromiso."
        ctaText="Solicitar una máquina"
      />
    </PaginaApoyo>
  );
}
