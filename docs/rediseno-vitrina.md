# Rediseño "Vitrina" — guía para construir secciones

Base del nuevo diseño de www.todovendingca.com (maqueta A "Vitrina"). Aquí está lo
que ya existe y cómo usarlo. Si algo de la maqueta se repite en dos secciones y
no está aquí, va a `client/src/components/vitrina/` o a `index.css`, no copiado
en cada sección.

- Tokens y clases: `client/src/index.css`
- Mapeo a Tailwind: `tailwind.config.ts`
- Fuentes: `client/index.html`
- Piezas React: `client/src/components/vitrina/` (se importan de `@/components/vitrina`)

## 1. Reglas que no se negocian

- **SSR**: nada de `window`/`document` fuera de efectos. El contenido se ve sin
  JavaScript: nada con opacidad 0 esperando una animación.
- **Movimiento**: las clases `v-*` ya se quedan quietas con "reducir movimiento".
  Si añades una animación propia, respétalo tú.
- **Dos temas**: usa siempre tokens (`var(--tinta)`, `text-tinta-2`…), nunca
  `#15171A` suelto para texto o fondos de página. Prueba la sección en oscuro.
- **Clases `v-*` completas en el código**: Tailwind borra del CSS las que no
  encuentra escritas tal cual. `"v-btn--" + tipo` no funciona; escribe
  `tipo === "p" ? "v-btn--p" : "v-btn--s"`.
- Conserva `data-testid`, ids de ancla, textos, enlaces y SEO de cada sección.

## 2. Tokens

### Colores Vitrina (variables CSS, mismos nombres que la maqueta)

| Variable | Claro | Oscuro | Uso | Tailwind |
|---|---|---|---|---|
| `--papel` | `#F3F1EB` | `#0E1012` | fondo de página | `bg-papel` (= `bg-background`) |
| `--papel2` | `#FAF9F5` | `#14161A` | fondo de sección alterna | `bg-papel-2` |
| `--blanco` | `#FFFFFF` | `#1B1E23` | tarjetas y campos | `bg-superficie` |
| `--tinta` | `#15171A` | `#F3F1EB` | texto principal | `text-tinta` |
| `--tinta2` | `#474C52` | `#C6CACF` | texto secundario | `text-tinta-2` |
| `--tinta3` | `#5E646B` | `#A9AEB4` | notas, pies de figura | `text-tinta-3` |
| `--linea` / `--linea2` | tinta 13 % / 28 % | blanco 13 % / 28 % | filetes | `border-linea`, `border-linea-2` |
| `--naranja` | `#F26A21` | igual | rellenos de marca | `bg-naranja` (= `bg-primary`) |
| `--naranja-h` | `#DC5510` | `#FF8A47` | naranja en títulos | `text-naranja-h` |
| `--naranja-t` | `#B4420A` | `#FF9A5C` | naranja en texto pequeño | `text-naranja-t` |
| `--azul` | `#1F6FD6` | igual | rellenos y puntos azules | `bg-azul` |
| `--azul-h` | `#1D62CC` | `#7FB2FF` | azul en títulos | `text-azul-h` |
| `--azul-t` | `#1A57B8` | `#9CC4FF` | azul en texto, iconos, enlaces | `text-azul-t` |
| `--marino` | `#1B263C` | `#E9EBEE` | nombre de la marca | `text-marino` |
| `--gabinete` | `#15171A` | `#1A1D21` | superficies de máquina (pie, gaveta, cita, marcos) | `bg-gabinete` |
| `--gabinete2` | `#0C0D0F` | igual | negro interior | `bg-gabinete-2` |
| `--gabinete-borde` | transparente | blanco 12 % | filete para separar el gabinete del fondo oscuro | `border-gabinete-borde` |
| `--plata-a/b/c`, `--plata-borde` | acero claro | un punto más apagado | columna y rieles | `bg-plata-b`… |
| `--led` / `--led-fondo` | `#8FE9FF` / `#081217` | igual | pantallas | `text-led`, `bg-led-fondo` |

Parejas "texto encima de": `--sobre-tinta`, `--sobre-naranja` (tinta),
`--sobre-azul`, `--sobre-plata` (tinta), `--sobre-gabinete` (blanco),
`--sobre-gabinete2` (`#B8BDC3`, texto secundario sobre gabinete).

Otros: `--foco` (color del foco), `--cabecera-fondo`, `--sombra-rgb` (para
`rgba(var(--sombra-rgb), .5)`), `--azul-velo` (hover azul suave).

**Los colores Vitrina de Tailwind no admiten opacidad** (`bg-tinta/50` no
existe). Para un tono translúcido usa `--linea`, `--linea2`, `--azul-velo` o un
`rgba()` propio.

**Qué cambia con el tema y qué no.** Papel, tinta, líneas y los tonos de texto
se invierten. Naranja, azul, plata, LED y gabinete son "la máquina" y se quedan.
Consecuencia: sobre plata o gabinete el texto NO puede ser `var(--tinta)` (en
oscuro sería claro sobre plata). `.v-plata`, `.v-riel` y `.v-columna` ya fijan
su color; en superficies de gabinete usa `--sobre-gabinete` / `--sobre-gabinete2`
y pon la clase `v-oscuro` al contenedor (foco claro y logo en blanco).

### Tokens shadcn

`--primary` es el naranja de marca y **encima va tinta** (`--primary-foreground`);
blanco sobre naranja no llega a AA. `--accent` es el azul de marca (blanco
encima). `--secondary` y `--muted` son neutros de papel. `--ring` es azul.

`text-primary` y `text-accent` no pintan el color de relleno sino su tono de
texto (`--primary-texto` `#B4420A`, `--accent-texto` `#1A57B8`; más claros en
oscuro) para cumplir contraste. `bg-primary`, `border-primary`, etc. siguen
siendo el naranja `#F26A21`.

### Medidas

- `--w: 1240px` ancho útil · `--pad: clamp(20px, 4.5vw, 56px)` margen lateral ·
  `--alto-cabecera: 68px`.
- Tailwind: `max-w-vitrina`, `px-pad-vitrina`, `pt-cabecera`, `top-cabecera`…

### Imágenes de fondo listas (variables)

`--ola` (4 franjas, 240×56), `--ola-trazo` (subrayado de dos trazos),
`--ola-etiqueta` (ola corta 30×12), `--ola-marca` (pincelada naranja bajo el
nombre en la columna), `--espiral` (par de espirales 62×22).
Ej. la franja inferior de una gift card: `background: var(--ola) 0 50% / 42cqw 100% repeat-x`.

## 3. Fuentes

| Clase | Fuente | Dónde |
|---|---|---|
| `font-sans` (por defecto) | Instrument Sans 400–700 | texto y botones |
| `font-display` | Bricolage Grotesque 400–800 | títulos (los `h1–h3` ya la llevan) |
| `font-mono` | IBM Plex Mono 400 y 600 | etiquetas, códigos, pies de figura |
| `font-led` | Doto 900 | pantallas LED |
| `font-fraunces` | Fraunces 600 (normal e itálica) | **solo** el avance de Café Oriente |

Se cargan sin bloquear el render. IBM Plex Mono solo trae 400 y 600: un
`font-weight: 500` se pinta como 400 (igual que en la maqueta). El texto base
de la maqueta es 17px/1.6: lo da la clase `v-base`, ya puesta en el contenedor
del inicio.

## 4. Convenciones de página y sección

```tsx
<section id="servicios" className="v-sec" data-testid="section-servicios">
  <div className="v-cont">
    <CabeceraSeccion
      etiqueta="Nuestros servicios"
      titulo={<>Soluciones <em className="n">completas</em></>}
      lead="Ofrecemos un servicio integral…"
    />
    …
  </div>
</section>
```

- **Contenedor**: `v-cont` (1240 px + márgenes). No uses `container mx-auto px-4`.
- **Espaciado**: `v-sec` (`padding-block: clamp(72px, 10vw, 136px)`). Fondo
  alterno con `v-sec--2`. Sección pegada a la anterior: `v-sec--pegada`
  (la maqueta lo hace en Café Oriente y Contacto).
- **Orden de fondos en el inicio** (maqueta): portada papel → ola → Nosotros
  `--2` → Servicios papel → Café Oriente papel (pegada) → Gift Cards `--2` →
  Ubicaciones papel → Propuesta `--2` → FAQ papel → Contacto papel (pegada) →
  ola del pie.
- **Título de sección**: etiqueta (`<Etiqueta>`) + `<h2 className="v-h2">` +
  lead (`v-lead`). En el `h2`, `<em>` = azul y `<em className="n">` = naranja.
  A dos columnas, `<CabeceraSeccion>`; con otra composición (Nosotros, FAQ,
  Contacto), las piezas sueltas. El `h1` de portada es `v-h1`. Para un `h3`
  con el mismo carácter pero tamaño propio: `v-tit` + tu tamaño.
- **Cabecera fija**: mide `--alto-cabecera`. El `<main>` del inicio ya lleva
  `v-bajo-cabecera` (le deja el hueco) e `id="contenido"`; la portada usa los
  paddings de la maqueta sin sumar nada. `html` tiene `scroll-padding-top: 84px`
  para las anclas; los `position: sticky` de la maqueta van con `top: 104px`.
- **La ola** entre la portada y Nosotros ya está en `home.tsx`. La del pie la
  pone `<Footer>`.
- **Cortes de la maqueta** (px): 1239 menú móvil · 1199 servicios · 999 portada
  a una columna · 899 dos columnas → una · 640/560/520/420 ajustes de móvil.
  No coinciden con `md/lg/xl` de Tailwind: usa `max-[899px]:…` o CSS propio.
- **Sangrado en móvil**: varios bloques oscuros de la maqueta salen medio margen
  (`margin-inline: calc(var(--pad) * -.5)`). Es por sección; `v-sec` ya recorta
  el desborde con `overflow-x: clip`.

## 5. Clases compartidas (`index.css`, capa `components`)

Una utilidad de Tailwind en el mismo elemento siempre gana a una clase `v-*`.

| Clase | Qué es |
|---|---|
| `v-base` | texto base 17px/1.6 de la maqueta (contenedor de página) |
| `v-cont` | contenedor centrado |
| `v-sec`, `v-sec--2`, `v-sec--pegada` | sección, fondo alterno, sin padding superior |
| `v-bajo-cabecera` | `padding-top` del alto de la cabecera |
| `v-oscuro` | contenedor siempre oscuro: foco claro, logo y marca en blanco |
| `v-h1`, `v-h2`, `v-tit` | títulos (con `em` y `em.n` de color) |
| `v-lead` | párrafo de apoyo |
| `v-etq` + `v-etq__o` | etiqueta mono con ola corta |
| `v-cab-sec` | cabecera de sección a dos columnas |
| `v-sub-ola` | subrayado de ola bajo una palabra |
| `v-btn` + `v-btn--p` / `--t` / `--s` / `--ch` | botón: principal naranja, tinta, contorno azul, chico |
| `v-icb` | botón de icono de 44 px |
| `v-ic`, `v-ic--r`, `v-ic--fl` | icono de línea, relleno, flecha que se desliza dentro de `v-btn` |
| `v-ola`, `v-ola--pie` | la ola animada; acepta `--ola-alto`, `--ola-ancho`, `--ola-desde` |
| `v-plata` | acero cepillado con borde y texto oscuro |
| `v-riel`, `v-riel--activo`, `v-riel__testigo` | riel plateado de precios |
| `v-tag` | código de selección (plaquita negra) |
| `v-ledchip`, `v-ledchip__punto` | etiqueta LED pequeña con punto que late |
| `v-led` | cifra LED grande |
| `v-pant`, `v-pant__rotulo/__valor/__texto` | pantalla de la columna |
| `v-espiral` | par de espirales (SVG) |
| `v-plano` | cuadrícula de plano que se desvanece (padre `relative` + `isolation: isolate`) |
| `v-logo`, `v-logo--mono`, `v-marca` | logo y marca |
| `v-columna`, `v-columna__marca/__ayuda/__cta`, `v-teclado` | columna plateada de control |
| `v-boceto`, `v-boceto--notas`, `v-maquina`, `v-notas` | figura de la Wittern 3535 |
| `v-cabecera…`, `v-nav`, `v-acc…`, `v-nav-movil…`, `v-pie…`, `v-salto` | cabecera y pie (no reutilizar) |

Animaciones: `v-ola` (desplaza el fondo) y `v-pulso` (latido de opacidad).

Botones: van en `<a>` o `<button>`.

```tsx
<a className="v-btn v-btn--p" href={WHATSAPP} target="_blank" rel="noopener noreferrer">
  <Icono nombre="whatsapp" /> Contáctanos ahora
</a>
<a className="v-btn v-btn--s" href="#servicios">
  Ver servicios <Icono nombre="flecha" flecha />
</a>
```

## 6. Componentes (`@/components/vitrina`)

### `Ola`, `OlaSubrayado` — `ola.tsx`

```ts
Ola({ variante?: "separador" | "pie", alto?: number, ancho?: number, desde?: string, className?, style? })
OlaSubrayado({ children, className? })
```

```tsx
<Ola />                                   {/* banda de 56 px entre secciones */}
<Ola alto={44} className="absolute inset-x-0 bottom-0" />   {/* pie de la cita */}
<h1 className="v-h1">Tu solución integral en máquinas <OlaSubrayado>vending</OlaSubrayado></h1>
```

`variante="pie"` (mitad papel, mitad gabinete) ya la usa `<Footer>`; `desde`
es el color de la mitad de arriba.

### `LogoTodoVending`, `LogoTrazos`, `Marca`, `MarcaContenido` — `logo.tsx`

```ts
LogoTodoVending({ variante?: "color" | "mono", titulo?: string, className?, ...atributosSvg })
LogoTrazos()                               // solo los trazos, para anidar en otro <svg viewBox="0 0 96 96">
Marca({ className?, variante?, children? })            // <span class="v-marca"> logo + "Todo / Vending CA"
MarcaContenido({ variante? })                          // lo de dentro, para tu propio <a class="v-marca">
```

```tsx
<LogoTodoVending className="w-[46px] h-[46px]" />            {/* decorativo */}
<LogoTodoVending variante="mono" className="w-12 h-12" />    {/* una tinta naranja, sobre plata */}
<figcaption className="v-oscuro …"><LogoTodoVending className="w-[46px] h-[46px]" /> …</figcaption>
```

El tamaño se da con clases (no tiene uno propio fuera de `v-marca`). Colores
por variables CSS en cualquier ancestro o en `style`: `--l2` (rojo-naranja),
`--l3` (azul), `--l4` (amarillo), `--l5` (azul claro), `--lf` (relleno
interior) y `color` (cuerpo). Ej. tarjeta azul de la maqueta:
`style={{ "--lf": "#1B5FC0", "--l3": "#A9CCFF", "--l5": "#A9CCFF" } as CSSProperties}`.

### `Icono` — `iconos.tsx`

```ts
Icono({ nombre: NombreIcono, flecha?: boolean, className?, ...atributosSvg })
```

Nombres: `snack` `bebida` `cafe` `instala` `camion` `llave` `tarjeta` `monitor`
`edificio` `salud` `birrete` `pesa` `bolsa` `avion` `corazon` `rayo` `premio`
`escudo` `sube` `aliado` `tel` `correo` `pin` `flecha` `arriba` `carrito` `menu`
`cerrar` `movil` `sinreg` `regalo` `enviar` `sol` `luna` y, rellenos,
`whatsapp` `instagram` `tiktok`. Mide `1.25em`; cambia tamaño con `w-… h-…` y
grosor con `style={{ strokeWidth: 1.15 }}`. Es decorativo (`aria-hidden`): el
nombre accesible va en el enlace o botón. Son los iconos de la maqueta: úsalos
en vez de lucide en las secciones del inicio.

### `Etiqueta`, `CabeceraSeccion` — `etiqueta.tsx`

```ts
Etiqueta({ children, className?, como?: "p" | "span" | "div" })
CabeceraSeccion({ etiqueta, titulo, lead?, idTitulo?, testIdTitulo?, className? })
```

```tsx
<Etiqueta>Sobre nosotros</Etiqueta>
<h2 className="v-h2">Quiénes somos en <em>Todo Vending CA</em></h2>
```

### `PantallaLed`, `CifraLed`, `ChipLed` — `pantalla-led.tsx`

```ts
PantallaLed({ rotulo?, valor, texto?, vivo?: boolean, className?, "data-testid"? })
CifraLed({ children, como?: "span" | "dd" | "div" | "strong", className?, "data-testid"? })
ChipLed({ children, punto?: boolean, className? })
```

```tsx
<PantallaLed rotulo="Selección" valor={codigo ?? "--"} texto={nombre ?? "Elige un servicio"} vivo />
<dl className="v-plata grid grid-cols-3 gap-[10px] p-[10px] rounded-[18px]">
  <div className="flex flex-col"><dt className="order-2 …">Disponibilidad</dt><CifraLed como="dd">24/7</CifraLed></div>
</dl>
<ChipLed>24/7</ChipLed>
```

Las cifras salen de los datos reales del componente (p. ej. el contador de
ubicaciones = `ubicaciones.length` con `padStart(2, "0")`), nunca escritas fijas.

### `Espiral`, `CodigoSeleccion`, `RielSeleccion` — `espiral.tsx`

```ts
Espiral({ className?, style? })
CodigoSeleccion({ codigo: string | number, decorativo?: boolean, className? })
RielSeleccion({ codigo?, children, activo?: boolean, testigo?: boolean, boton?: atributosDeButton, className? })
```

```tsx
<RielSeleccion codigo={10} activo={sel === "10"}
  boton={{ onClick: () => elegir("10"), "aria-pressed": sel === "10", "aria-label": "Señalar Máquinas de snacks, código 10" }}>
  Snacks
</RielSeleccion>
<RielSeleccion className="h-[34px] text-[10.5px]" testigo={false}>Oficinas</RielSeleccion>  {/* sin botón: <div> */}
```

Códigos de la maqueta: bandeja de máquinas 10, 12, 14, 16; bandeja de servicio
20, 22, 24, 26 (portada: 10, 12, 14). Derívalos del índice del arreglo de datos.

### `ColumnaControl`, `TecladoSeleccion` — `columna-control.tsx`

```ts
ColumnaControl({ children, etiqueta?: string, conMarca?: boolean, conOla?: boolean, className?, "data-testid"? })  // <aside>
TecladoSeleccion({ onTecla: (tecla: TeclaSeleccion) => void, etiqueta?: string, className? })
type TeclaSeleccion = "0" … "9" | "borrar" | "siguiente"
```

```tsx
<ColumnaControl>
  <PantallaLed rotulo="Selección" valor={valor} texto={texto} vivo />
  <TecladoSeleccion onTecla={alTeclear} />
  <p className="v-columna__ayuda" aria-hidden="true">Marca un código (por ejemplo 1&nbsp;·&nbsp;4) o toca un servicio</p>
  <div className="v-columna__cta">
    <h3>¿Quieres una máquina en tus instalaciones?</h3>
    <p>…</p>
    <a className="v-btn v-btn--p" href={WHATSAPP}>Solicitar información</a>
  </div>
</ColumnaControl>
```

El teclado no guarda estado: la lógica de la maqueta (acumular dos dígitos,
"Marca otro dígito", "Código sin servicio" 1,6 s, `#` = siguiente, `C` = borrar)
va en la sección de Servicios. Por debajo de 1200 px la columna se acuesta y
oculta teclado y ayuda; por debajo de 640 px queda a una columna.

### `MaquinaWittern`, `DibujoWittern`, `NOTAS_MAQUINA` — `maquina-wittern.tsx`

```ts
MaquinaWittern({ className?, notas?: boolean, plano?: boolean, pie?: ReactNode })   // <figure>
DibujoWittern({ className? })                                                       // solo el <svg>
```

```tsx
<MaquinaWittern />   {/* columna derecha de la portada, tal cual */}
```

Trae el dibujo, la cuadrícula de plano, las guías y anotaciones (visibles de
700 a 999 px y desde 1280 px) y el pie "Fig. 1 · Wittern 3535…". Usa ids fijos
en el SVG: **una sola vez por página**. Archivo generado desde la maqueta; no
se retoca a mano.

## 7. Cabecera, pie y tema

- `Header` (sin props): fija, 68 px. Incluye "Saltar al contenido", menú móvil
  (< 1240 px), carrito con contador, selector de tema y WhatsApp.
- `Footer({ desde?: string })`: pinta la ola y el pie. Si lo último antes del
  pie no tiene fondo papel, pasa su color: `<Footer desde="var(--papel2)" />`.
- `ThemeToggle({ testId? })`: botón `v-icb` con sol/luna.
- La insignia de TodoWeb Digital va en el pie con `tema="oscuro"` (el pie es
  oscuro en los dos temas).

## 8. Foto de la sección Nosotros

`/assets/maquinas-todovending-v1.webp` (1600×1200) y
`/assets/maquinas-todovending-800-v1.webp` (800×600). Lleva versión en el
nombre porque `/assets/` se sirve con caché de un año: si cambia la foto, cambia
el número.

```tsx
<img
  src="/assets/maquinas-todovending-v1.webp"
  srcSet="/assets/maquinas-todovending-800-v1.webp 800w, /assets/maquinas-todovending-v1.webp 1600w"
  sizes="(max-width: 899px) 90vw, 520px"
  width={1600} height={1200} loading="lazy" decoding="async"
  alt="Máquinas expendedoras de Todo Vending CA: una de bebidas y una de snacks con la ola naranja y azul en la columna de control"
/>
```

La maqueta la recorta a 1:1 dentro de un marco de gabinete (`object-fit: cover`,
`transform: scale(1.07)` con origen `52% 44%`, filtro
`brightness(1.05) contrast(1.06) saturate(1.08)`).

## 9. Pendiente de quien haga cada sección

- **Portada**: ya no hay `<link rel="preload">` de `maquina_vending_hero.webp`
  en `index.html` (la portada nueva es el dibujo SVG). El archivo sigue en
  `/assets/` porque el sitemap de imágenes lo cita.
- Las clases anteriores `glow-primary`, `vending-grid`, `glass`,
  `animate-gradient` siguen existiendo porque la Tienda y las subpáginas las
  usan; no las uses en secciones nuevas.
- `gift-card-visual.tsx` (tarjeta de la Tienda) pinta un degradado
  `from-primary to-accent`: ahora es naranja → azul. Si se rediseña, que sea con
  el abanico de la maqueta.

## 10. Estado final (cierre del rediseño)

Rediseñado con la maqueta A "Vitrina": inicio completo (portada, Nosotros,
Servicios con teclado, avance de Café Oriente, Gift Cards, Ubicaciones,
Propuesta, FAQ, Contacto), cabecera, pie, las tres subpáginas (Lechería,
Empresas, Gimnasios) y la 404. La Tienda (`/gift-card`, `/carrito`,
`/pago/resultado`, `/admin`) solo hereda tokens y tipografías; su lógica, el
servidor y Café Oriente no se tocaron.

### Ajustes hechos tras la revisión

- **Cabecera**: el nombre "TODO VENDING CA" se ve desde 360 px (solo se oculta
  entre 320 y 359 px).
- **Portada a 320 px**: los tres distintivos ya no se parten en mitad de palabra.
- **Táctil en pantallas anchas** (`@media (pointer: coarse)`): enlaces del pie
  de 44 px, rieles de Servicios de 40 px y controles del carrito y la Tienda de
  40 px. Con ratón todo queda como en la maqueta.
- **Formulario de contacto**: borde de los campos con `--tinta3` (contraste
  3:1), foco con `--foco` (visible también en oscuro) y ajuste a 320 px para
  que el correo no se parta.
- **Modo oscuro de las subpáginas**: el vidrio de beneficios se apaga igual que
  el de Servicios del inicio.
- **Preguntas frecuentes**: cada pregunta vuelve a ser un `<h3>` dentro del
  `<summary>` (inicio y subpáginas), sin cambio visual.
- **Tienda, solo aspecto**:
  - la insignia "Sin stock" va abajo a la derecha de la tarjeta (regla en
    `index.css`, sin tocar `gift-card.tsx`) para no tapar el logo;
  - `ui/input`, `ui/textarea` y `ui/select` usan `bg-superficie` en claro
    (campos blancos sobre tarjeta blanca, como el formulario de contacto);
  - `text-destructive` pinta `--destructive-texto` (más claro en oscuro) y el
    `--destructive` oscuro baja a `0 72% 48%` para que el blanco encima cumpla AA.

### Pendiente de decisión del dueño (no se cambió)

- `/vending-gimnasios`: el título "Actualmente en" queda corto; propuesta
  "Actualmente en Lechería". Es cambio de texto.
- Sitemap de imágenes (`client/public/sitemap.xml` y `server/routes.ts`): sigue
  citando `/assets/maquina_vending_hero.webp`, que el inicio ya no muestra. No
  borrar ese archivo mientras no se actualice el sitemap.
- Las fuentes se cargan sin bloquear el pintado (la maqueta las carga de forma
  bloqueante): puede verse un instante la fuente de reserva en conexiones lentas.

### Diferencias conocidas con la maqueta

- Selector de tema claro/oscuro en la cabecera (la maqueta no lo tiene).
- Sin la nota de maqueta del formulario de contacto.
- Bordes de los campos del formulario algo más marcados (accesibilidad).
- Contadores (ubicaciones, clientes) calculados desde los datos reales.

### Animaciones de la Tienda

`/gift-card` conserva sus apariciones al desplazar (framer-motion, archivo
vetado): en una captura de página entera sin desplazar, "Cómo funciona" y el
título de las preguntas salen en blanco. No es un fallo del rediseño.
