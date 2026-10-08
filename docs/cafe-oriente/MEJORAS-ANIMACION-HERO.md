## Lo que pasa hoy

El video reparte el scroll por segundos y no por acción. Lo medí cuadro a cuadro: el tramo en que el chorro solo cae (de 3,8 a 5 s, el más quieto del video) recibe media pantalla de scroll, igual que el armado del vaso, que tiene unas 11 veces más movimiento. Entre 1,5 y 2,7 s las tres capas solo flotan; en el primer segundo sí hay movimiento, porque la cámara se desplaza. Los textos van un paso detrás de la imagen: "Leche cremosa" aparece mientras sigue cayendo el chorro oscuro, "Espuma de leche" cuando la espuma ya bajó, y el párrafo de Chocolate todavía dice "Cacao de cuerpo intenso", aunque quitaste el cacao. Lo más vistoso, el vaso armado con CAFÉ ORIENTE encendido en dorado a los 7,25 s, nunca se ve limpio: el velo del cierre entra a los 7,20 s y oscurece esa zona un 38 %. En el teléfono, donde está la mayoría, es peor. El texto ocupa la parte de abajo, justo donde está el vaso, y en ninguna de las capturas móviles aparecen el vaso ni la marca.

*Todo esto está medido con ffmpeg sobre el video y con Chrome simulando teléfonos de 360 a 412 px de ancho. Nada se ha probado todavía en un teléfono de verdad.*

---

## Lo que yo haría

Va por bloques y, dentro de cada bloque, primero lo que más cambia con menos trabajo. **Si solo hicieras cuatro cosas, serían la 1, la 2, la 4 y la 7:** que el vaso con la marca se vea, también en el teléfono, y que justo en ese momento se pida la estación.

### La animación

**1. El vaso terminado, por fin a la vista**
- **Qué cambia para el visitante:** cuando el vaso termina de armarse, en el teléfono el texto y su sombra oscura se desvanecen. El mocachino con el logo dorado queda limpio a pantalla completa durante algo más de un tercio de pantalla de scroll, y después entra el cierre. En computadora aparece en la columna izquierda un paso final que cierra el círculo con el titular, y el riel marca los 4 ingredientes como hechos:
  - Etiqueta: **Tu mocachino**
  - Título: **Listo. Tu *respiro*.**
  - Texto: **Espuma firme, café de grano y el sello Café Oriente encendido en el vaso. Igual a las 7 de la mañana que a las 3 de la madrugada.**
- **Por qué:** hoy ese momento se ve limpio 0 segundos. Con la mejora 2 quedaría visible unos 38 % de pantalla de scroll. Sin la curva, la versión que no cambia la velocidad del video lo deja en un 19 %.
- **Esfuerzo:** bajo. Hay un detalle técnico ya identificado para que el texto no desaparezca a quien tiene activado "reducir movimiento".
- **Tus decisiones:** no toca nada.

**2. Más scroll para la acción, menos para lo quieto**
- **Qué cambia para el visitante:** las partes donde el video solo flota pasan más rápido y lo que sí se mueve dura más bajo el dedo. Pantallas de scroll por tramo (datos medidos y calculados con la curva):

| Tramo del video | Qué pasa | Hoy | Propuesta |
|---|---|---|---|
| 0 – 2,7 s | flotan las capas | 1,18 | 0,98 |
| 2,7 – 3,8 s | cae el chorro | 0,50 | 0,56 |
| 3,8 – 5,0 s | el chorro sigue, nada más cambia | 0,51 | 0,25 |
| 5,0 – 6,0 s | la espuma baja al vaso | 0,48 | 0,39 |
| 6,0 – 7,2 s | se arma el vaso, aparece la paleta | 0,50 | 0,63 |
| 7,2 – 7,9 s | se enciende el logo | 0,33 (bajo el velo) | 0,35 (limpio) |

  A un tercio del recorrido ya cae el chorro (hoy apenas asoma), y al 85 % se ve el vaso con el logo (hoy está a medio armar). Tendría que sentirse más corto sin acortar nada, pero eso lo juzgas tú.
- **Esfuerzo:** bajo. Son unas pocas cifras en el código y se revierte igual de fácil.
- **Tus decisiones:** se mantienen los 24 fps, los 450vh y el seguimiento directo, y el video sigue pegado al dedo, sin retraso. Lo que cambia, y tienes que probarlo tú, es el armado del vaso. Hoy el cuadro cambia cada 1,8 % de pantalla deslizada. Con la curva, en ese tramo, cambiaría cada 2,6 %. La versión de 12 fps que descartaste lo hacía cada 2,1 %. Cada salto es la mitad de grande que en aquella versión, pero solo tu dedo dirá si se siente a saltos. Empezaría con una versión más suave (cerca de 2,2 %) y la subiría si te gusta.

**3. Cada texto aparece cuando pasa lo que nombra**
- **Qué cambia para el visitante:** los textos se enganchan al segundo del video y no al porcentaje de scroll. Así siguen sincronizados aunque cambie la curva. Los titulares describen lo que se ve:
  - **Paso 1** (desde 0,95 s, flota la corona de espresso). Etiqueta: **01 · Espresso**. Título: **Todo empieza en el *grano***. Texto: **Esa corona de crema es espresso de grano entero, molido en el instante de tu pedido. Nunca café instantáneo: por eso el aroma llega antes que la taza.**
  - **Paso 2** (desde 2,45 s, justo antes de que caiga la primera gota). Etiqueta: **02 · Chocolate**. Título: **Cae el *chocolate***. Texto: **Un hilo de chocolate de cuerpo intenso atraviesa el espresso y baja directo al vaso. Es lo que convierte un café con leche en un mocachino.**
    - Alternativa más prudente, porque el hilo se ve oscuro como café: Título **Un solo *chorro***. Texto: **La estación sirve chocolate y espresso en un mismo hilo, directo al vaso. Siempre la misma medida.**
  - **Paso 3** (desde unos 3,3 s, el chorro entra en la nube blanca y la tiñe). Etiqueta: **03 · Leche**. Título: **Atraviesa la *leche***. El párrafo se queda como está, porque decidiste dejarlo tal cual: "Vaporizada a la temperatura justa para envolver el café sin apagarlo. Ni tibia ni hirviendo: en su punto, taza tras taza."
  - **Paso 4** (desde 4,85 s, la nube baja al vaso). Etiqueta: **04 · Espuma**. Título: **La espuma *corona* el vaso**. Texto: **La nube baja, el espresso se asienta encima y el vaso se arma solo, capa sobre capa. Siempre del mismo grosor.**
- **Por qué:** hoy, desde la mitad del video, cada texto llega un paso tarde. Además se corrige lo del "cacao". El corte de Leche se adelanta para que no quede en apenas un tercio de pantalla al combinarlo con la curva.
- **Esfuerzo:** bajo.
- **Tus decisiones:** cambia titulares que tú aprobaste, así que conviene que los veas en vivo. No toca las cifras.

### En el teléfono

**4. Que el vaso aparezca en el teléfono**
- **Qué cambia para el visitante:** entre Leche y Espuma el encuadre sube despacio, hasta un cuarto del alto del video, siguiendo la bebida. La espuma entrando al vaso y el logo quedan por encima del texto en vez de debajo. Cuando el texto se apaga para el vaso terminado (mejora 1), el encuadre vuelve a su sitio y el vaso queda centrado. También haría que la sombra oscura del texto empiece justo encima de él y no a un tercio de la pantalla: en un teléfono de 390x844 eso deja entre 65 y 114 px más de video limpio.
- **Por qué:** hoy, en el teléfono, el vaso y la marca no salen nunca.
- **Cómo se mueve:** depende del segundo del video, así que sigue al dedo y se detiene cuando el dedo se detiene. Los dos jueces no se pusieron de acuerdo aquí. La variante más sencilla mueve el encuadre por pasos, con una transición de casi un segundo, y eso hace que la imagen se deslice sola aunque el dedo esté quieto, justo lo que no te gustó. Por eso me quedo con la versión continua.
- **Esfuerzo:** medio.
- **Riesgo:** en Chrome se vio bien, a 360, 390 y 412 px de ancho. Mover un video dentro de un bloque fijo no lo he probado en un iPhone con Safari. Eso solo se confirma en un iPhone real.
- **Tus decisiones:** no toca las cifras, pero es un movimiento de cámara que no está en el video, así que hay que verlo.

**5. Una pista "Desliza" que no tape el botón, y una barra de progreso**
- **Qué cambia para el visitante:**
  - Hoy la pista es un icono de ratón, una idea de computadora, y tapa unos 13 px del botón "Lleva Café Oriente a tu empresa" en los 6 tamaños de teléfono medidos.
  - Con el cambio, en pantallas táctiles aparece una flecha que sube, en una sola línea debajo de los botones, con el texto **Desliza y mira cómo se arma**.
  - La pista solo aparece si a los 1,2 s el visitante no ha deslizado.
  - Durante la animación se ven abajo 4 rayitas finas, una por ingrediente, que se llenan con el dedo. Que esto reduzca la sensación de "largo" es una suposición; no lo he probado con usuarios.
- **Accesibilidad:** el lector de pantalla dice hoy que los ingredientes caen "uno a uno dentro del vaso", y eso no pasa en el video. Propongo: **Un mocachino Café Oriente se arma en el aire: un hilo de chocolate atraviesa el espresso y la leche, la espuma corona el vaso y se enciende el logo**.
- **Esfuerzo:** bajo.
- **Tus decisiones:** no toca nada.

**6. Un titular legible al abrir la página**
- **Qué cambia para el visitante:** cuando la página abre con las barras del navegador visibles, que es como llega todo el mundo, el titular cae sobre la nube blanca. En el peor 10 % del fondo el contraste es de 2 a 2,8, por debajo del mínimo recomendado de 3. Con una sombra suave sube a entre 3,2 y 4,1. El antetítulo dorado de 9 px ("Café Oriente · Marca registrada de TodoVending, C.A.") se lee aún peor y repite lo que ya dice el menú de arriba, así que lo ocultaría en el teléfono.
- **Esfuerzo:** bajo.
- **Tus decisiones:** es una decisión menor. "Marca registrada" desaparece del encabezado en el teléfono, pero sigue en las preguntas frecuentes y en el pie de página.

### Que la animación pida la estación

**7. Un cierre que pide la estación y que cabe en la pantalla**
- **Hoy:** el cierre dice "Cuatro ingredientes. Un botón de distancia.", que habla del producto, y su botón principal lleva al menú. Además no cabe en pantallas bajas. En un Android básico (360x560) el segundo botón termina en el píxel 612 de una pantalla de 560 y el titular queda debajo del menú de arriba. En un iPhone SE con Safari pasa lo mismo.
- **Texto propuesto:**
  - Antetítulo: **Para empresas y clínicas**
  - Título: **Este respiro, en tu *empresa*.**
  - Texto: **La misma estación Bianchi LEI 400 que acabas de ver, instalada sin costo en tu oficina o clínica. Cada bebida en menos de 40 segundos, las 24 horas, sin que nadie tenga que atenderla.**
  - Botón principal: **Pedir mi estación** (abre WhatsApp con el mensaje ya escrito). Secundario: **Ver las 10 bebidas**.
  - Las cifras se quedan. Opcional: cambiar "100% automática" por **0 gestión · La atendemos nosotros**. Las etiquetas pequeñas de las cifras tienen que crecer, porque quedan de 8 a 9 px.
  - "Instalada sin costo" se entiende mejor que "gratis en tu empresa", que alguien podría leer como "café gratis". Si prefieres la versión directa: **Esta estación, *gratis* en tu empresa.** con el texto **La instalamos, la reponemos y le damos mantenimiento. Tu equipo elige su bebida y la paga desde el teléfono.**
- **Composición, dos opciones:**
  - **(a)** El panel de hoy, arreglado para que quepa: en pantallas de menos de 760 px de alto se oculta el párrafo (lo que dice ya está en las cifras) y las 4 cifras van en una fila. Con la mejora 1 el vaso ya se vio limpio justo antes. Esfuerzo bajo.
  - **(b)** Un cierre nuevo. En el teléfono el vaso con el logo sube, se reduce a dos tercios y sigue visible arriba, y la petición va en una franja oscura abajo. En computadora no hay velo: texto a la izquierda, vaso al centro y cifras a la derecha. Comprobé que cabe en 360x560 y en 375x553. Junta en el mismo momento el producto en su mejor plano y la petición. El cambio de tamaño del vaso dura 0,7 s y no sigue al dedo. Esfuerzo medio.
- **Tus decisiones:** el titular, qué botón va primero y, en la opción (b), una composición que tú aprobaste.

**8. Una primera pantalla que diga para quién es**
- **Hoy:** el encabezado no dice en ningún sitio "gratis", "sin costo" ni "clínica". "Gratis" aparece por primera vez 11,6 pantallas más abajo en un teléfono típico. El botón naranja es "Descubre el menú".
- **Propuesta:** el titular "El respiro que tu jornada necesita" no se toca (importa para Google). Subtítulo: **Café en grano molido al instante por una estación 100% automática, 24/7 y sin efectivo. Para empresas y clínicas, la instalación es gratis.** Botón principal: **Quiero la estación gratis** (WhatsApp). Secundario: **Ver el menú**. "Para empresas y clínicas" va en el subtítulo y no en el antetítulo, porque a 9 px sobre la espuma no se lee. Comprobé que cabe en las pantallas bajas a la misma altura que hoy.
- **Riesgo:** si llega mucha gente que solo quiere tomar café, por ejemplo por un QR en las máquinas, pierde protagonismo. No pude comprobar si eso pasa. "Ver el menú" sigue en la primera pantalla.
- **Esfuerzo:** bajo.
- **Tus decisiones:** quién es el público principal. Eso lo decides tú.

**9. Que cada etiqueta de ingrediente lleve un beneficio para la empresa**
Es la etiqueta dorada pequeña de cada paso, lo que lee quien pasa rápido:
- Espresso: **Grano entero · nunca instantáneo** (hoy: "Molienda al momento · < 40 seg")
- Chocolate: **Receta exacta · sin barista** (hoy: "Dosificación automática · siempre igual")
- Leche: **Cero gestión · la atendemos nosotros** (hoy: "Temperatura controlada · sin supervisión")
- Espuma: **También de noche · 24/7** (hoy: "Textura uniforme · 10 bebidas del menú")

Es solo texto, no toca los párrafos y el esfuerzo es bajo. Si se escriben otras, conviene que no pasen de unos 38 caracteres, porque las más largas se parten en dos en un teléfono de 360 px.

**10. Un mensaje de WhatsApp distinto en cada botón**
El visitante no nota nada, pero por la primera línea de cada conversación sabrás desde qué parte de la página te escribieron. Hoy la página no mide nada, así que es la única forma de saber si estas mejoras traen empresas:
- Primera pantalla: "Hola, vi Café Oriente en la web y quiero la estación gratis en mi empresa"
- Durante la animación: "Hola, quiero información para instalar Café Oriente en mi empresa"
- Cierre: "Hola, quiero pedir una estación Café Oriente para mi empresa"
- Sección empresas (ya existe): "Hola, quiero instalar una estación Café Oriente en mi empresa"

Es aproximado, porque si alguien edita el mensaje se pierde la pista, y quien atiende el WhatsApp tiene que conocer la lista. Esfuerzo bajo.

**11. Una salida durante la animación (tú eliges)**
En el teléfono hay 2,7 pantallas de animación sin ningún botón de empresa a la vista, porque el del menú queda dentro del menú desplegable, y no hay forma de saltársela. En la misma franja de las rayitas de progreso se puede poner un enlace discreto **Saltar animación ↓**, que lleva directo a la sección siguiente y responde a lo de "muy largo" sin tocar los 450vh, o una pastilla verde **Instalar gratis** que abre WhatsApp, o las dos. Los jueces no coincidieron en cuál va primero: uno prefería la de WhatsApp por su valor comercial, el otro el enlace por ser más limpio. Las dos son de esfuerzo bajo. Añaden un elemento sobre una animación que te gusta limpia, así que lo mejor es que las veas.

### Peso

**12. Un video un 15 % más liviano**
Pasaría de 3,60 MB a 3,04 MB, unos 550 KB menos para gente con datos caros, con la misma resolución, los mismos 24 fps y todos los cuadros clave. Lo comprobé sobre el video actual: la calidad medida baja muy poco (0,963 frente a 0,970) y en recortes a tamaño real de la espuma, las gotas y el logo no se ve diferencia. Como ya notaste que la espuma se emborrona cuando se baja la resolución, hay que mirarla en tu teléfono antes de publicar. Esfuerzo bajo y no toca ninguna decisión. Complementa el arreglo de precarga que ya señaló la auditoría, que ahorra más.

### Opcional, al final

**13. Una primera pantalla que "respira"**
Mientras nadie desliza, el espresso y la espuma se mueven suavemente en un ciclo de 4 s, y al deslizar ese movimiento se funde en 0,35 s con la animación de siempre. Así se nota desde el primer segundo que no es una foto. El archivo ya está hecho y pesa 129 KB. Tiene costes: esos 129 KB los descargan todos, y el prototipo actual no respeta "reducir movimiento" (hay que arreglarlo). Supongo, sin haberlo comprobado, que en un iPhone en modo de bajo consumo no arrancaría y podría mostrar un botón de reproducir que habría que esconder. Esfuerzo bajo; no toca ninguna decisión.

---

## Lo que no haría

- **Frenar el video en el armado cuando alguien desliza muy rápido.** En un teléfono el video podría seguir moviéndose hasta unos 0,7 s después de soltar el dedo (estimado). Es el mismo retraso que no te gustó.
- **Que la página "encaje" sola un ingrediente por deslizamiento.** Mueve la página sin el dedo. En las pruebas, 6 de 6 arrastres lentos fueron devueltos al paso anterior y el video retrocedía solo.
- **Hacer "respirar" el video saltando por él sin parar.** Exige unos 38 saltos por segundo durante hasta 24 s, lo que gasta batería en teléfonos modestos y probablemente no se vea en iPhone. Si quieres ese efecto, la opción 13 es la buena.
- **Reeditar el archivo de video para cambiar el ritmo.** Consigue lo mismo que la mejora 2, pero 93 de sus 200 cuadros son inventados por interpolación (52 de ellos en el armado), el final va ampliado y cada ajuste obliga a recodificar. Lo guardaría como plan B por si con la curva el armado se siente a saltos.
- **Acelerar todo el video por igual para que termine antes.** Equivale a acortar el scroll un 12 % en todas partes. La curva usa ese espacio mejor. Solo lo usaría si descartas la curva.
- **Bajar el video aún más (−28 %)** sin verlo antes en un teléfono: la espuma se ablanda.

---

## Si algún día se hace un video nuevo

No lo propongo ahora, porque te gusta este. Hay cosas que ningún ajuste arregla: Chocolate y Leche no se distinguen (es un solo chorro oscuro), el vaso está en la mitad de abajo, que es justo donde va el texto en el teléfono, y al final aparece el botón "Order Now". Si algún día se regenera, el pedido sería este:
- Vertical 9:16, idealmente 1080x1920, de 10 a 12 s a 24 fps. Cámara fija, sin acercamientos, sin textos ni botones y sin marca de agua cerca del vaso.
- Cinco momentos de unos 2 s cada uno, bien distintos:
  1. cae el espresso con crema;
  2. una cinta espesa y brillante de chocolate, más opaca y rojiza que el café;
  3. un chorro blanco de leche;
  4. la espuma corona el vaso;
  5. el vaso Café Oriente queda centrado y quieto 2 s, con vapor.
- Toda la acción en el 55 % de arriba del cuadro, con el 40 % de abajo tranquilo para el texto. El vaso final, entre el 35 % y el 70 % del alto. Sin tramo de flotado al principio.
- Riesgos: la IA puede volver a deformar el logo y habría que repetir todo el ajuste.

---

## Para decidir

1. **¿Para quién es la primera pantalla?** ¿Para la empresa, con el botón naranja "Quiero la estación gratis" por WhatsApp, o para quien toma el café, con el menú? ¿Sabes si llega gente por un QR pegado en las máquinas?
2. **En el cierre, ¿opción (a) o (b)?** La (a) es el panel de hoy, arreglado para que quepa y con el texto nuevo. La (b) deja el vaso a la vista arriba y la petición abajo. ¿Prefieres "instalada sin costo" o "gratis en tu empresa"?
3. **Durante la animación en el teléfono, ¿qué más quieres además de las rayitas?** ¿"Saltar animación", la pastilla verde de WhatsApp, las dos o ninguna?

**Por dónde empezaría:** una página de prueba aparte, sin tocar la publicada, igual que la página de ajuste con la que elegiste los 24 fps, para abrirla en tu teléfono. Llevaría:
- un interruptor entre "como hoy" y "con curva", y dos intensidades de curva en el armado (la suave y la completa);
- el vaso limpio antes del cierre y los textos enganchados al video, con las dos versiones del paso 2 para que elijas;
- en el teléfono, el encuadre que sube con la bebida, la pista arreglada y las rayitas de progreso.

Lo comercial (cierre, primera pantalla, WhatsApp) va después de que respondas las preguntas 1 y 2, porque son decisiones de negocio y no de sensación. Tres cosas solo se pueden confirmar en un teléfono de verdad: si el armado con la curva se siente a saltos, cómo se comporta el encuadre móvil en iPhone con Safari y cómo se ve la espuma con el video más liviano. Nada se publica sin que lo hayas visto y aprobado.