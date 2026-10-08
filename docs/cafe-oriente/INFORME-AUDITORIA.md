# Informe: sección Café Oriente (todovendingca.com)

## 1. Diagnóstico en una frase

La página está bien construida y la animación del hero funciona, pero **le cuesta convertir visitas en pedidos**. No muestra WhatsApp, teléfono ni correo, nunca dice que la instalación es gratis y no menciona a ningún cliente. Además, en móvil **tarda más de lo necesario en mostrar el título**, porque espera a las fuentes de Google y descarga el video completo aunque el visitante nunca deslice.

| Lighthouse (producción) | Móvil | Escritorio |
|---|---|---|
| Rendimiento | 82 | 94 |
| Accesibilidad | 94 | — |
| Buenas prácticas | 96 | — |
| SEO | 100 | — |
| Tiempo hasta ver el título principal (LCP) | 3,5 s | 1,2 s |
| Peso total de la página | 3.682 KiB (el 98 % es el video) | — |
| Saltos de diseño al cargar (CLS) | 0 | — |

## 2. Lo que está bien (no hay que tocarlo)

- **La animación del hero.** El video a 24 fps, los 450vh y el seguimiento directo funcionan. El código guarda las medidas, solo trabaja cuando hay scroll y nunca avanza más allá de lo ya descargado. Probamos recargar a media página, entrar directo a #menu, volver atrás y cambiar el tamaño de la ventana, y en todos los casos se comporta bien.
- **La página no "salta" al cargar** (CLS 0) y nada bloquea los toques del usuario (TBT 0).
- **SEO técnico.** Nota 100. Los datos estructurados (JSON-LD, 7 bloques) se leen sin errores.
- **El menú de bebidas.** Son botones reales y el menú móvil anuncia si está abierto. El texto principal del hero tiene muy buen contraste (9:1).
- **Los enlaces al home** desde el header y el footer están bien hechos. No hay que cambiarlos.

## 3. Mejoras recomendadas

### Arreglos rápidos (esfuerzo bajo, se pueden hacer hoy)

**1. Poner WhatsApp, teléfono y correo visibles en la página** (impacto alto, unos 15-20 min)
- **Qué pasa hoy:** la página no tiene ningún enlace de WhatsApp, `tel:` ni `mailto:`. El número solo aparece escondido dentro del código para Google (línea 47). Todos los botones ("Solicitar", nav, hero) llevan a la sección #empresas. Desde ahí, el único enlace (línea 1108) manda al formulario genérico del home, y además apunta a `todovendingca.com` sin `www`, lo que provoca una redirección extra (301, confirmada con curl).
- **Qué propongo:**
  - En la tarjeta de #empresas, poner como botón principal **"Escríbenos por WhatsApp"**, con el mensaje ya escrito: *"Hola, quiero instalar una estación Café Oriente en mi empresa"*. El botón del formulario queda como secundario.
  - Cambiar el enlace del formulario a `/?origen=cafe-oriente#contacto`. Al ser una ruta del mismo sitio, desaparece la redirección.
  - En el pie y en la respuesta "¿Cómo instalo una máquina?" del FAQ, añadir el teléfono +58 414-616-4177 y el correo, ambos pulsables.
  - En los datos para Google (bloque Organization), añadir el teléfono, el correo y el tipo de contacto "ventas".
- **Por qué importa:** en Venezuela, la vía natural para hacer un pedido entre empresas es WhatsApp. Hoy, quien está convencido tiene que salir de la página, esperar a que cargue el home completo con su conexión lenta y llenar un formulario.
- **Detalle técnico:** la página aplica estilos a todos los enlaces (`a`) de forma global, así que los nuevos deben usar las clases `.btn` que ya existen.
- **Para después:** un botón flotante de WhatsApp en móvil. Sirve, pero hay que calcular bien que no tape el hero.

**2. Quitar el bloqueo de las fuentes de Google** (impacto alto, unas 1-2 h)
- **Qué pasa hoy:** antes de pintar el título, el navegador abre conexiones con dos servidores de Google, descarga una hoja de estilos (de 329 a 854 ms) y luego las fuentes (hasta los 1.408 ms). Lighthouse calcula **1,55 s de bloqueo**, y el título queda **1,68 s** esperando para pintarse.
- **Qué propongo:**
  - Descargar los dos archivos de fuente (Fraunces con sus ejes de grosor y tamaño óptico, y Sora) y servirlos desde nuestro propio sitio como `/cafe-oriente/assets/fraunces-latin-v1.woff2` y `sora-latin-v1.woff2`.
  - Declararlos dentro de la página.
  - Pedir por adelantado (precargar) solo la fuente del título, Fraunces.
  - Quitar las líneas 34-36.
- **Por qué importa:** es lo que más acelera la primera impresión en móvil. Calculo que el título aparecería **entre 1 y 1,5 s antes**, aunque la cifra exacta solo se sabe midiendo después del cambio. Los archivos llevan `-v1` en el nombre, así que el caché de 1 año del servidor les sirve.
- **Riesgo:** bajo. Hay que comprobar que la ñ y los acentos se ven con la fuente correcta.

**3. Decir claramente que la instalación es gratis** (impacto alto, unos 20 min, **requiere tu confirmación**)
- **Qué pasa hoy:** la página nunca dice "gratis" ni "sin costo para tu empresa". Solo dice "sin inversión en personal ni logística" (líneas 72, 1097 y 1137), lo que suena a que la máquina sí se paga. El resto del sitio sí lo dice siempre ("La instalación es completamente gratuita", en el FAQ del home y en llms.txt). Simplemente no se copió a esta página.
- **Qué propongo:**
  - Cambiar el texto de entrada de #empresas a: *"Instalamos tu estación Café Oriente sin costo. La instalación, la reposición y el mantenimiento corren por TodoVending; tu empresa solo pone el espacio."*
  - Usar la misma frase en el FAQ visible, en el FAQ de los datos para Google y en la descripción del producto.
  - Poner "Instalación gratuita" como primer beneficio en #empresas y en el bloque del home.
- **Por qué importa:** es la primera duda de cualquier empresa. Si no se responde, el visitante no da el paso.
- **Ojo:** digo "reposición", no "abastecimiento sin costo", porque el café lo paga quien lo toma.

**4. Mostrar clientes actuales** (impacto medio, unos 20 min)
- **Qué pasa hoy:** la página no nombra a ningún cliente, aunque el resto del sitio ya los publica.
- **Qué propongo:** antes de la tarjeta de contacto, una franja con *"Ya confían en TodoVending en Lechería y Barcelona: Clínica Anzoátegui, Clínica Zambrano, Centro Empresarial Colón, Centro Empresarial Oleus y Colegio El Manglar"*. Va en texto y no como encabezado, para no romper el orden de títulos.
- **Por qué importa:** una empresa confía más en un proveedor que ya trabaja con otras que conoce.
- **Cuidado:** solo diría "Café Oriente ya sirve en…" si confirmas qué sitios tienen la estación de café.

**5. Arreglar el favicon** (impacto bajo, 10 min)
- **Qué pasa hoy:** la página no declara icono y `/favicon.ico` da error 404, que aparece en la consola y resta puntos en buenas prácticas.
- **Qué propongo:** añadir enlaces a los archivos `favicon.svg`, `favicon.png` y `apple-touch-icon.png`, que ya existen. Además, crear un `favicon.ico` real con ffmpeg para que el error desaparezca en todo el sitio.

**6. Acortar el título y la descripción para Google** (impacto bajo, 5 min)
- **Qué pasa hoy:** el título tiene 77 caracteres y la descripción 297, así que Google los corta.
- **Qué propongo:**
  - Título: *"Café Oriente: Máquina de Café en Grano 24/7 en Venezuela"*.
  - Descripción: *"Estación Bianchi de café en grano recién molido para empresas, clínicas y oficinas en Venezuela. 24/7, 10 bebidas, sin efectivo: Pago Móvil y tarjetas."*
- **Después:** revisar los clics en Search Console unas semanas más tarde.

**7. Pequeños retoques de legibilidad y navegación** (impacto bajo, unos 20 min en total)
- El texto legal del pie tiene un contraste de 3,63:1 (el mínimo es 4,5:1). Subirlo a `rgba(255,246,234,.62)`.
- Los nombres inactivos del riel de ingredientes (solo visible en escritorio) tienen un contraste de 3,07:1. Aplicar el mismo cambio y marcar el paso activo para los lectores de pantalla.
- En móvil, al pulsar "Descubre el menú", la barra fija tapa unos 10 px del inicio de la sección. Se arregla añadiendo `scroll-padding-top:4.5rem`.
- La imagen de compartir (og-image) pesa 443 KB, y WhatsApp suele no mostrar la vista previa con imágenes de más de unos 300 KB. Recomprimirla por debajo de 200 KB como `og-image-v2.jpg` y declarar su tamaño.
- El fondo desenfocado (2 KB) se descarga con prioridad alta y le quita prioridad al póster, que es la imagen que sí se ve. Pasarle la prioridad al póster.

### Mejoras de impacto (esfuerzo medio)

**8. No descargar el video entero hasta que el usuario empiece a deslizar** (impacto alto en datos, unos 30-45 min con pruebas)
- **Qué pasa hoy:** el video de 3,6 MB empieza a bajar a los 359 ms, antes que las fuentes, aunque el visitante solo mire y se vaya o pulse un botón sin deslizar. Peor aún: quien tiene activado "reducir movimiento" en su teléfono descarga los 3,6 MB y luego la página los tira, porque a esas personas les mostramos una imagen fija.
- **Qué propongo:**
  - Cambiar `preload="auto"` por `preload="metadata"`.
  - Activar la descarga completa en el primer gesto del usuario: toque, scroll, rueda o tecla.
  - En la rama de "reducir movimiento", cancelar la descarga del video.
- **Por qué importa:** quien rebota pasa de gastar unos 3,7 MB a unos 0,2 MB. Además, el video deja de competir con lo que hace falta para ver la página.
- **Honestidad:** casi todos los visitantes del hero deslizan, así que a ellos se les descarga igual. El ahorro real es para quien se va o salta directo al contacto. En el primer deslizamiento rápido, el video puede ir unos segundos detrás (el póster tapa ese hueco). **Esto hay que probarlo en un iPhone y en un Android barato con conexión lenta** antes de publicarlo.
- **No toca:** los 24 fps, los 450vh ni el seguimiento directo.

**9. Responder las objeciones de una empresa en el FAQ** (impacto medio, unos 30 min una vez tengas los datos)
- **Qué pasa hoy:** las 6 preguntas actuales tratan del producto y del pago. Ninguna responde cuánto cuesta para la empresa, cuánto espacio y qué corriente necesita, en qué ciudades instalan ni si hay un mínimo de personas.
- **Qué propongo:** añadir 3 o 4 preguntas con **tus datos reales**, tanto en el FAQ visible como en el de Google. No voy a publicar "110 V" ni medidas sin que me las confirmes.

**10. Teclado y lectores de pantalla en el hero y el menú** (impacto bajo-medio, unos 45 min)
- **Teclado:** quien navega con el tabulador termina en los dos botones del panel de cierre mientras están invisibles (las líneas 940-941 solo se ocultan con transparencia). Propongo que, cuando el foco entre ahí, la página se desplace hasta ese tramo para que se vean.
- **Menú de bebidas:** los botones tienen títulos `h4` dentro, lo cual no es HTML válido y es el origen del aviso "heading-order" de Lighthouse. Propongo:
  - Cambiarlos por `span`.
  - El título de la ficha que se abre pasa a `h3`.
  - Usar `aria-expanded` en lugar de `aria-current`, para que el lector anuncie "desplegado".
  - Cerrar la ficha con Escape.
- De paso, unificar la regla CSS `.sel`, que está duplicada (una dice cursor normal y la otra cursor de mano).

**11. Bloque de Café Oriente en el home** (impacto medio, unos 30 min el bloque y hasta 1 h el arreglo general)
- **Imagen:** hoy el bloque muestra un círculo degradado ("sol") donde debería ir el producto. Propongo poner la foto real de la máquina (`maquina-v1.webp`, 62 KB, ya publicada), con carga diferida y altura limitada para que no estire la tarjeta en móvil.
- **Visibilidad:** el servidor entrega este bloque, **y otras secciones del home**, invisible (`opacity:0`) hasta que termina de cargar el JavaScript. En una conexión lenta, el bloque y su botón no se ven durante ese tiempo. Propongo que la animación de entrada solo ocurra después de cargar el JavaScript, aplicado en todo el home.
- **Retoques menores:** el botón no muestra un estado visible al enfocarlo con el teclado, y la etiqueta "Marca registrada" tiene un contraste de 3,9:1. Se pueden corregir de paso.

**12. Saber cuántos pedidos vienen de Café Oriente** (impacto medio, unos 30 min)
- **Qué pasa hoy:** el formulario del home no sabe de dónde viene el visitante.
- **Qué propongo:** que lea `?origen=cafe-oriente` y prellene "Estación Café Oriente", con un campo oculto que llegue en el correo. Así sabrás qué pedidos genera esta página.

**13. Datos para Google: "Servicio" en vez de "Producto"** (impacto bajo, unos 15 min)
- **Qué pasa hoy:** el bloque Product no tiene precio ni reseñas, así que Search Console lo marcará con advertencias.
- **Qué propongo:** describirlo como un **Service** (servicio de café vending ofrecido por TodoVending), que es lo que realmente es.

### Proyectos más grandes (esfuerzo alto)

No hace falta ninguno. Los dos puntos que más se acercan son el arreglo de visibilidad del punto 11, aplicado a todo el home, y el seguimiento del origen de los pedidos del punto 12, porque tocan la parte React del sitio. Cada uno es de horas, no de días.

## 4. Cosas que NO recomiendo hacer

- **Volver al video sin fondo, bajar los fps o acortar el recorrido.** Son decisiones tuyas, tomadas probando en vivo, y nada de lo encontrado obliga a revertirlas.
- **Recortar los grosores de las fuentes para ahorrar KB.** La página sí usa el grosor 400 y la negrita 700. Si se recortan, el navegador fabricaría negritas falsas, y el ahorro es pequeño frente al bloqueo real.
- **Una fuente de respaldo "calibrada" como solución al LCP.** No acelera nada por sí sola. Lo que retrasa el título es la hoja de Google, y eso lo resuelve el punto 2.
- **Reestructurar el cálculo de medidas del hero** (el aviso de "forced reflow" de 380 ms). Ese trabajo se haría igual en otro momento, y moverlo reintroduce un fallo con el video en caché.
- **Un temporizador que quite el video si tarda más de 8 s.** En 3G, el video tarda unos 17 s en descargarse completo sin que haya ningún error, así que mataría la animación a gente con conexión lenta pero que funciona. Si el video falla del todo, los textos siguen cambiando sobre el póster. Como mucho, añadiría un aviso de error que ponga la imagen final.
- **Ocultar los pasos del hero a los lectores de pantalla** (con `inert`, `aria-hidden` o `visibility`). Los usuarios ciegos dejarían de poder leer los pasos y el panel de cierre. El problema real es solo el del teclado (punto 10).
- **Poner "precio 0" en los datos para Google, o reseñas sin tener reseñas reales.** El precio 0 se leería como "el café es gratis", y las reseñas inventadas van contra las normas de Google.
- **Enlazar desde el home directo a #empresas.** El visitante se saltaría la animación y el menú, que es justo lo que convence. A lo sumo, añadir junto al botón actual un enlace secundario de WhatsApp con un mensaje específico de Café Oriente.
- **Cambiar las tarjetas de beneficios del home por cifras sueltas.** Hoy ya coinciden con la página.
- **Quitar "cacao" del texto alternativo de la imagen final.** La foto sí muestra cacao espolvoreado, y ese texto describe la foto. Lo único opcional es que el paso del chocolate (línea 886) no empiece con la palabra "Cacao".

## 5. Lo que necesito de ti

1. **¿La instalación de Café Oriente es gratis igual que el resto del vending?** ¿Sin cuotas y sin consumo mínimo? ¿Qué pone la empresa: solo el espacio y la electricidad?
2. **Las medidas de la Bianchi LEI 400 y lo que necesita:** voltaje, y si usa agua de la red o de garrafón.
3. **Las zonas donde instalan** (Lechería, Barcelona, Puerto La Cruz…).
4. **¿Hay un mínimo de personas o de tazas al día?** ¿Se puede publicar un precio orientativo por bebida?
5. **¿Qué clientes tienen ya la estación de café?** ¿Me das permiso para usar sus logos o una frase suya?
6. **¿Es pública la dirección del C.C. Venezuela (Local 11)** y se puede poner en la página?
7. **El plazo real de instalación**, para poner los pasos "Nos escribes → Visita técnica → Instalamos".
8. **(Opcional) Las recetas reales de la máquina.** Hoy las capas de cada vaso son una ilustración y por eso no mostramos porcentajes.

## 6. Orden sugerido

1. WhatsApp, teléfono y correo visibles, y el enlace del formulario corregido (punto 1).
2. "Instalación gratuita" y la franja de clientes, en cuanto me confirmes los datos (puntos 3 y 4).
3. Fuentes servidas desde el propio sitio (punto 2), y después medir otra vez con Lighthouse en móvil.
4. Favicon, título y descripción, contrastes, og-image y prioridad del póster (puntos 5 a 7), todo en una sola tanda.
5. Retrasar la descarga del video y cancelarla con "reducir movimiento" (punto 8), **probándolo antes en iPhone y en un Android barato**.
6. FAQ de objeciones con tus datos, y el bloque "Service" para Google (puntos 9 y 13).
7. Foto de la máquina y arreglo de visibilidad en el home, y seguimiento del origen de los pedidos (puntos 11 y 12).
8. Teclado y menú accesibles (punto 10).

Como pediste, nada se publica sin que lo veas y lo apruebes antes.

---

# Revisión del crítico

## Huecos detectados

1. **La página no mide nada.** `cafe-oriente/index.html` no carga ninguna herramienta de analítica. Busqué `gtag|analytics|plausible|fbq` en la página, en `client/index.html` y en `client/src`, y no aparece en ninguno. El punto 12 solo registra los pedidos que llegan por el formulario. Hoy no hay forma de saber cuántos entran, cuántos hacen scroll en el hero, cuántos abren una bebida o cuántos pulsan el futuro botón de WhatsApp (punto 1). El tráfico de WhatsApp nunca pasa por el formulario.
   - **Propuesta:** instalar una analítica ligera y sin cookies, como Plausible, Umami o Cloudflare Web Analytics (unos 1 a 2 KB, con `defer`). Registrar como eventos: `click_whatsapp`, `click_tel`, `click_mailto`, `abrir_bebida`, y cuándo el visitante llega al 50 % y al 100 % del `.mocha`. Esfuerzo: 1 h. Riesgo: bajo.
   - **Privacidad:** al no usar cookies no hace falta banner. Si se elige Google Analytics, habría que añadir el aviso de consentimiento y cuenta en el peso de la página. Sin este punto, nada del orden sugerido se puede evaluar después.

2. **El HTML no lleva compresión gzip.** Las cabeceras reales de `/cafe-oriente` muestran `Cache-Control: public, max-age=0` y no incluyen `Content-Encoding` (salida de `curl -sI` sobre `/cafe-oriente`). El contexto da por hecho que Railway comprime con gzip, pero en esta respuesta no aparece. La petición fue hecha sin `Accept-Encoding`, así que falta repetirla con `curl -sI -H "Accept-Encoding: gzip, br"` antes de darlo por fallo. Si sigue sin comprimir, son unas 1.470 líneas con CSS, JS y siete bloques JSON-LD en línea viajando en crudo por conexiones lentas. El TTFB medido es bueno (0,29 s).
   - **Propuesta:** verificar con esa cabecera. Si falta, añadir `compression()` en `server/index.ts` o confirmar la compresión del proxy. Esfuerzo: 15 min. Riesgo: bajo.

3. **La imagen para compartir (og-image) no lleva versión y se guarda en caché un día.** `/cafe-oriente/og-image.jpg` responde con `max-age=86400` y pesa 453.328 bytes. El punto 7 propone `og-image-v2.jpg`, pero no explica que WhatsApp y Facebook guardan su propia copia de la vista previa. Hay que forzar que la vuelvan a leer con el Sharing Debugger de Facebook. Además, en las líneas 26-32 faltan `og:image:width`, `og:image:height` y `og:image:type`, y el `og:title` (línea 22) es distinto del `twitter:title` (línea 30).
   - **Propuesta:** añadir esas tres etiquetas, unificar los dos títulos y volver a leer la URL en el depurador después de publicar. Esfuerzo: 10 min.

4. **Modo oscuro e impresión: nada que arreglar.** No hay reglas `prefers-color-scheme` ni `@media print`, pero la página ya tiene diseño oscuro propio y declara `theme-color #3D2314` (línea 33). No lo propongo como hueco. Solo lo anoto para que nadie lo añada al informe como fallo.

## Afirmaciones dudosas del informe

5. **El peso del video no coincide.** El informe dice que pesa 3,6 MB, y el contexto dice 3,4 MB. Lo real es `Content-Length: 3601568`, es decir 3,43 MiB o 3,6 MB. Las dos cifras son correctas según la unidad, pero conviene usar una sola en todo el documento.

6. **El punto 7 justifica mal el nombre `-v2` del og-image.** Ese archivo no está bajo `/assets/`, así que no recibe el caché `immutable` de un año: su caché es de un día. Versionarlo no hace daño. Lo que de verdad renueva la vista previa en WhatsApp y Facebook es volver a leer la URL en sus depuradores (ver hueco 3).

7. **La sección "Lo que está bien" contradice el punto 10.** Elogia el menú de bebidas ("Son botones reales"), pero el punto 10 reconoce que esos mismos botones llevan `h4` dentro, que no es HTML válido. El elogio debería matizarse.

Archivos revisados:
- `C:/Users/mente/AppData/Local/Temp/claude/C--Users-mente-Downloads-todovending-sistema-3-todovending/d7694bda-1b9d-404d-84f3-5acc2dc7f329/scratchpad/repo/client/public/cafe-oriente/index.html`
- `C:/Users/mente/AppData/Local/Temp/claude/C--Users-mente-Downloads-todovending-sistema-3-todovending/d7694bda-1b9d-404d-84f3-5acc2dc7f329/scratchpad/repo/client/index.html`
- `C:/Users/mente/AppData/Local/Temp/claude/C--Users-mente-Downloads-todovending-sistema-3-todovending/d7694bda-1b9d-404d-84f3-5acc2dc7f329/scratchpad/repo/client/src`