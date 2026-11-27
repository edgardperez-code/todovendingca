import { PaginaApoyo } from "@/components/pagina-apoyo";
import { CabeceraSeccion } from "@/components/vitrina/etiqueta";
import { Icono, type NombreIcono } from "@/components/vitrina/iconos";
import { SubpageCTA } from "@/components/subpage-cta";
import { EnlaceInterno } from "@/lib/navegacion";
import { useSEO } from "@/lib/seo";
import { SITE_URL, organizationSchema, breadcrumbSchema } from "@/lib/schema";

// Qué se vende en cada tipo de máquina. Sin precios ni marcas: cambian con el
// inventario. El menú de café es el de Café Oriente (client/public/llms.txt).
const MAQUINAS: { icono: NombreIcono; nombre: string; texto: string; productos: string[] }[] = [
  {
    icono: "snack",
    nombre: "Máquina de snacks",
    texto: "Para comer algo rápido en cualquier momento.",
    productos: ["Galletas", "Chocolates", "Snacks salados", "Opciones más saludables, según la ubicación"],
  },
  {
    icono: "bebida",
    nombre: "Máquina de bebidas frías",
    texto: "Bebidas frías disponibles las 24 horas.",
    productos: ["Agua", "Refrescos", "Jugos", "Bebidas energéticas"],
  },
  {
    icono: "pesa",
    nombre: "Vending deportivo",
    texto: "Para gimnasios y espacios deportivos.",
    productos: ["Bebidas energéticas", "Barras de proteína", "Agua", "Snacks saludables"],
  },
];

const CAFE_CON_CAFE = [
  { nombre: "Capuchino", texto: "Espresso, leche y espuma de leche a partes casi iguales." },
  { nombre: "Mocachino", texto: "Espresso, chocolate, leche, espuma de leche y cacao espolvoreado." },
  { nombre: "Café con Leche", texto: "Espresso y leche, con más leche que café." },
  { nombre: "Latte Vainilla", texto: "Espresso, leche, vainilla y espuma de leche." },
  { nombre: "Capuchino Vainilla", texto: "Espresso, leche, vainilla y espuma, con más espuma que el latte." },
  { nombre: "Café Marrón", texto: "Mitad espresso y mitad leche: el marrón venezolano." },
  { nombre: "Café Largo Negro", texto: "Solo espresso y agua; la bebida más intensa del menú." },
];

const CAFE_SIN_CAFE = [
  { nombre: "Chocolate Caliente", texto: "Chocolate y agua." },
  { nombre: "Chocolate con Leche", texto: "Chocolate y leche, más suave y cremoso." },
  { nombre: "Té con Limón", texto: "Té negro, limón y agua; sin café ni leche." },
];

export default function CatalogoProductos() {
  useSEO({
    title: "Catálogo de Productos de Nuestras Máquinas Expendedoras | Todo Vending CA",
    description:
      "Qué se vende en las máquinas de Todo Vending CA: snacks, bebidas frías, vending deportivo y el menú de café en grano de Café Oriente. Productos a la medida de cada ubicación.",
    path: "/catalogo-productos",
    jsonLd: [
      organizationSchema,
      breadcrumbSchema([
        { name: "Inicio", path: "/" },
        { name: "Catálogo de productos", path: "/catalogo-productos" },
      ]),
      {
        "@context": "https://schema.org",
        "@type": "Menu",
        name: "Menú de Café Oriente",
        url: `${SITE_URL}/catalogo-productos#cafe`,
        hasMenuSection: [
          {
            "@type": "MenuSection",
            name: "Bebidas con café",
            hasMenuItem: CAFE_CON_CAFE.map((b) => ({ "@type": "MenuItem", name: b.nombre, description: b.texto })),
          },
          {
            "@type": "MenuSection",
            name: "Bebidas sin café",
            hasMenuItem: CAFE_SIN_CAFE.map((b) => ({ "@type": "MenuItem", name: b.nombre, description: b.texto })),
          },
        ],
      },
    ],
  });

  return (
    <PaginaApoyo
      etiqueta="Catálogo"
      titulo={
        <>
          Qué hay en nuestras <em className="n">máquinas</em>
        </>
      }
      lead="Cada máquina se llena con productos elegidos junto con el lugar donde está. Estos son los tipos de máquina y lo que suele llevar cada una."
    >
      <section className="v-sec v-sec--2">
        <div className="v-cont">
          <CabeceraSeccion
            etiqueta="Tipos de máquina"
            titulo={
              <>
                Snacks, bebidas y <em>deporte</em>
              </>
            }
            lead="La selección exacta cambia según la ubicación y lo que más se consume. Si quieres un producto en particular, pídelo."
          />
          <ul className="va-grid">
            {MAQUINAS.map((m) => (
              <li key={m.nombre}>
                <article className="va-card">
                  <Icono nombre={m.icono} />
                  <h3>{m.nombre}</h3>
                  <p>{m.texto}</p>
                  <ul className="va-lista">
                    {m.productos.map((p) => (
                      <li key={p}>{p}</li>
                    ))}
                  </ul>
                </article>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="v-sec" id="cafe">
        <div className="v-cont">
          <CabeceraSeccion
            etiqueta="Café Oriente"
            titulo={
              <>
                Café en grano, <em className="n">recién molido</em>
              </>
            }
            lead="La estación de Café Oriente muele el café en el momento de cada pedido y tiene la bebida lista en menos de 40 segundos. Funciona sin efectivo: tarjeta de débito, crédito, Pago Móvil y débito inmediato."
          />
          <div className="va-grid">
            <article className="va-card">
              <Icono nombre="cafe" />
              <h3>Bebidas con café</h3>
              <ul className="va-lista">
                {CAFE_CON_CAFE.map((b) => (
                  <li key={b.nombre}>
                    <strong>{b.nombre}:</strong> {b.texto}
                  </li>
                ))}
              </ul>
            </article>
            <article className="va-card">
              <Icono nombre="cafe" />
              <h3>Bebidas sin café</h3>
              <ul className="va-lista">
                {CAFE_SIN_CAFE.map((b) => (
                  <li key={b.nombre}>
                    <strong>{b.nombre}:</strong> {b.texto}
                  </li>
                ))}
              </ul>
              <p className="va-nota">
                <a href="/cafe-oriente">Conoce Café Oriente</a>
              </p>
            </article>
          </div>
        </div>
      </section>

      <section className="v-sec v-sec--2">
        <div className="v-cont">
          <CabeceraSeccion
            etiqueta="Cómo se paga"
            titulo={
              <>
                Varias formas de <em>pago</em>
              </>
            }
            lead="Según la máquina: efectivo, tarjeta de débito o crédito y Pago Móvil. También puedes usar las Gift Cards Todo Vending en las máquinas y en Café Oriente."
          />
          <div className="vs-hero__cta">
            <EnlaceInterno className="v-btn v-btn--p" href="/solicitar-maquina">
              Quiero una máquina
              <Icono nombre="flecha" flecha />
            </EnlaceInterno>
            <EnlaceInterno className="v-btn v-btn--s" href="/gift-card">
              Ver Gift Cards
            </EnlaceInterno>
          </div>
        </div>
      </section>

      <SubpageCTA
        title="¿Quieres estos productos en tu espacio?"
        text="Elegimos contigo la selección de productos e instalamos la máquina sin costo."
        ctaText="Solicitar una máquina"
      />
    </PaginaApoyo>
  );
}
