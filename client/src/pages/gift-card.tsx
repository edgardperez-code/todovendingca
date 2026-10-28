import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ToastAction } from "@/components/ui/toast";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { AvisoModoPrueba } from "@/components/aviso-modo-prueba";
import { GiftCardVisual } from "@/components/gift-card-visual";
import { SelectorCantidad } from "@/components/selector-cantidad";
import NotFound from "@/pages/not-found";
import { useToast } from "@/hooks/use-toast";
import { useCarrito } from "@/lib/carrito";
import { formatoUsd, textoUnidades } from "@/lib/formato";
import { useSEO } from "@/lib/seo";
import { SITE_URL, organizationSchema, breadcrumbSchema, faqSchema } from "@/lib/schema";
import { useStock } from "@/lib/stock-tienda";
import { cn } from "@/lib/utils";
import { MAX_UNIDADES_POR_PEDIDO, PRODUCTOS, redondearUsd, type Producto } from "@shared/catalogo";
import {
  ArrowRight,
  Banknote,
  Gift,
  Info,
  Landmark,
  ShoppingCart,
  Smartphone,
  UserX,
  Zap,
} from "lucide-react";
import { SiWhatsapp } from "react-icons/si";
// motion propio: el contenido sale visible desde el servidor (ver lib/movimiento).
import { motion } from "@/lib/movimiento";

// Las tres denominaciones, en el orden del catalogo compartido (precios y topes
// salen SIEMPRE de ahi).
const giftCards = PRODUCTOS.filter((p) => p.esGiftCard);

// "$10" en el titulo (sin decimales si el monto es entero).
function montoCorto(monto: number): string {
  return Number.isInteger(monto) ? `$${monto}` : formatoUsd(monto);
}

// "$10, $25 y $50"
function listaMontos(productos: readonly Producto[]): string {
  const montos = productos.map((p) => montoCorto(p.precioUsd));
  if (montos.length <= 1) return montos.join("");
  return `${montos.slice(0, -1).join(", ")} y ${montos[montos.length - 1]}`;
}

const MONTOS = listaMontos(giftCards);
const MONTO_MINIMO = giftCards.length > 0 ? montoCorto(Math.min(...giftCards.map((p) => p.precioUsd))) : "";

function faqsDe(productos: readonly Producto[]) {
  return [
    {
      question: "¿De qué montos hay Gift Cards?",
      answer: `Hay Gift Cards de ${listaMontos(productos)}. Puedes combinar varias denominaciones en un mismo pedido.`,
    },
    {
      question: "¿En qué moneda pago la Gift Card?",
      answer:
        "El precio está en dólares y se paga en bolívares, a la tasa oficial del BCV del día del pago. Antes de confirmar verás el monto exacto en Bs en la página de pago.",
    },
    {
      question: "¿Necesito crear una cuenta?",
      answer:
        "No. La compra es sin registro: solo pedimos tu nombre y tu correo (y tu teléfono, si quieres) para identificar tu compra y tu comprobante.",
    },
    {
      question: "¿Cómo pago?",
      answer:
        "Con Débito Inmediato o Pago Móvil desde tu banco, en la página segura de SPIDI, nuestra pasarela de pago. No necesitas registrarte en SPIDI.",
    },
    {
      question: "¿Cuándo recibo mi Gift Card?",
      answer:
        "En cuanto el banco confirma el pago verás en pantalla un código por cada Gift Card que compraste, junto con tu comprobante. Guárdalos o imprímelos.",
    },
    {
      question: "¿Dónde puedo usarla?",
      answer: "En las máquinas de Todo Vending CA y en Café Oriente.",
    },
    {
      question: "¿Cuántas Gift Cards puedo comprar?",
      answer: `Hasta ${MAX_UNIDADES_POR_PEDIDO} por pedido, sumando todas las denominaciones. Si necesitas más, puedes hacer otro pedido o escribirnos por WhatsApp.`,
    },
    {
      question: "¿Qué significa «Sin stock»?",
      answer:
        "Que por ahora no quedan Gift Cards de ese monto. Reponemos los códigos con frecuencia: vuelve a intentarlo más tarde o elige otra denominación.",
    },
  ];
}

const pasos = [
  {
    icon: Gift,
    titulo: "Elige monto y cantidad",
    texto: "Agrega al carrito las Gift Cards de $10, $25 o $50 que quieras regalar o usar.",
  },
  {
    icon: Smartphone,
    titulo: "Paga en bolívares",
    texto:
      "En la página segura de SPIDI, con Débito Inmediato o Pago Móvil desde tu banco, a tasa BCV del día. Sin registrarte.",
  },
  {
    icon: Zap,
    titulo: "Recibe tus códigos",
    texto:
      "Al confirmarse el pago verás un código por cada Gift Card y tu comprobante. Guárdalos o imprímelos.",
  },
];

const ventajas = [
  { icon: UserX, texto: "Sin registro" },
  { icon: Landmark, texto: "Débito Inmediato o Pago Móvil" },
  { icon: Zap, texto: "Códigos al instante" },
];

export default function GiftCardPage() {
  if (giftCards.length === 0) return <NotFound />;
  return <GiftCardContenido productos={giftCards} />;
}

function GiftCardContenido({ productos }: { productos: readonly Producto[] }) {
  const faqs = faqsDe(productos);

  useSEO({
    title: `Gift Cards Todo Vending de ${MONTOS} | Paga en Bolívares | Todo Vending CA`,
    description: `Compra Gift Cards Todo Vending desde ${MONTO_MINIMO} (${MONTOS}) para snacks, bebidas y café en nuestras máquinas y en Café Oriente. Pagas en bolívares a tasa BCV del día con Débito Inmediato o Pago Móvil, sin registrarte.`,
    path: "/gift-card",
    jsonLd: [
      organizationSchema,
      breadcrumbSchema([
        { name: "Inicio", path: "/" },
        { name: "Gift Cards", path: "/gift-card" },
      ]),
      // Un Product por denominacion. Sin "availability": el stock se conoce
      // solo en el navegador y no se debe anunciar algo que quiza no hay.
      ...productos.map((producto) => ({
        "@context": "https://schema.org",
        "@type": "Product",
        name: producto.nombre,
        description: `Tarjeta de regalo por ${montoCorto(producto.precioUsd)} para consumir en las máquinas de Todo Vending CA y Café Oriente. Se paga en bolívares a tasa BCV del día.`,
        sku: producto.id,
        image: `${SITE_URL}/og-image.jpg`,
        brand: { "@type": "Brand", name: "Todo Vending CA" },
        offers: {
          "@type": "Offer",
          url: `${SITE_URL}/gift-card`,
          priceCurrency: "USD",
          price: producto.precioUsd.toFixed(2),
          seller: { "@id": `${SITE_URL}/#organization` },
        },
      })),
      faqSchema(faqs),
    ],
  });

  const destacada = productos[Math.min(1, productos.length - 1)];

  return (
    <div className="min-h-screen bg-background" data-testid="page-gift-card">
      <Header />
      <main>
        {/* Presentacion y productos */}
        <section className="relative pt-28 md:pt-36 pb-16 md:pb-24 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div
              className="absolute -top-40 -right-40 w-80 h-80 bg-primary/10 rounded-full blur-3xl"
              animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute -bottom-40 -left-40 w-96 h-96 bg-accent/10 rounded-full blur-3xl"
              animate={{ scale: [1.2, 1, 1.2], opacity: [0.5, 0.3, 0.5] }}
              transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
            />
          </div>

          <div className="container mx-auto px-4 relative z-10">
            <AvisoModoPrueba className="max-w-6xl mx-auto mb-8" />
            <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center max-w-6xl mx-auto mb-14 md:mb-20">
              {/* Tarjeta: primero en movil, a la derecha en escritorio */}
              {/* La primera pantalla no tiene animacion de entrada: sale
                  pintada desde el servidor (sin pestaneo). */}
              <div className="flex justify-center lg:order-last">
                <motion.div
                  className="w-full max-w-sm md:max-w-md"
                  animate={{ y: [0, -10, 0], rotate: [-2, 0, -2] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                >
                  <GiftCardVisual montoUsd={destacada.precioUsd} tamano="lg" />
                </motion.div>
              </div>

              <div>
                <Badge className="mb-5" variant="secondary">
                  Tarjetas de regalo
                </Badge>
                <h1 data-speakable className="text-4xl md:text-5xl font-bold tracking-tight mb-5">
                  <span className="text-foreground">Gift Cards</span>{" "}
                  <span className="text-primary">Todo Vending</span>{" "}
                  <span className="text-foreground">de {MONTOS}</span>
                </h1>
                <p className="speakable text-lg text-muted-foreground mb-6 max-w-xl">
                  El regalo perfecto para tu equipo, tus clientes o alguien especial: snacks, bebidas y café
                  en las máquinas de Todo Vending CA y en Café Oriente.
                </p>
                <p className="flex items-start gap-2 text-sm text-muted-foreground mb-6">
                  <Banknote className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                  Precios en dólares; se paga en bolívares a tasa BCV del día.
                </p>
                <div className="flex flex-wrap gap-2">
                  {ventajas.map((v) => (
                    <Badge key={v.texto} variant="outline" className="py-1.5 px-3 gap-2 font-medium">
                      <v.icon className="h-3.5 w-3.5 text-primary" />
                      {v.texto}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            <div
              id="elegir"
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto"
              data-testid="lista-gift-cards"
            >
              {productos.map((producto) => (
                <TarjetaProducto key={producto.id} producto={producto} />
              ))}
            </div>
            <p className="max-w-6xl mx-auto mt-6 text-center text-sm text-muted-foreground">
              Hasta {MAX_UNIDADES_POR_PEDIDO} Gift Cards por pedido, sumando todas las denominaciones.
            </p>
          </div>
        </section>

        {/* Como funciona */}
        <section className="py-20 md:py-28">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-3xl mx-auto text-center mb-14"
            >
              <Badge className="mb-4" variant="secondary">
                Cómo funciona
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                <span className="text-foreground">Compra en</span>{" "}
                <span className="text-primary">tres pasos</span>
              </h2>
              <p className="text-lg text-muted-foreground">
                Sin cuentas ni contraseñas. Pagas desde tu banco y recibes tus códigos en pantalla.
              </p>
            </motion.div>
            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {pasos.map((paso, i) => (
                <motion.div
                  key={paso.titulo}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className="h-full hover-elevate group">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                          <paso.icon className="w-6 h-6 text-primary" />
                        </div>
                        <span className="text-sm font-semibold text-muted-foreground">Paso {i + 1}</span>
                      </div>
                      <h3 className="font-semibold text-lg text-foreground mb-2">{paso.titulo}</h3>
                      <p className="text-muted-foreground text-sm">{paso.texto}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Preguntas frecuentes */}
        <section id="faq" className="py-20 md:py-28 bg-muted/30" data-testid="section-faq-gift-card">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mb-12"
              >
                <Badge className="mb-4" variant="secondary">
                  Preguntas Frecuentes
                </Badge>
                <h2 data-speakable className="text-3xl md:text-4xl font-bold mb-4">
                  <span className="text-foreground">Todo sobre las</span>{" "}
                  <span className="text-primary">Gift Cards</span>
                </h2>
              </motion.div>

              <Accordion type="single" collapsible className="w-full space-y-3">
                {faqs.map((faq, index) => (
                  <AccordionItem
                    key={faq.question}
                    value={String(index)}
                    className="bg-background rounded-xl border px-6 data-[state=open]:border-primary/30"
                    data-testid={`faq-gift-card-${index}`}
                  >
                    <AccordionTrigger className="text-left hover:no-underline py-5 text-foreground font-medium">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground pb-5">{faq.answer}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>

              <div className="mt-12 text-center">
                <p className="text-muted-foreground mb-4">¿Tienes otra pregunta? Escríbenos.</p>
                <a
                  href="https://wa.me/584146164177?text=Hola%2C%20tengo%20una%20pregunta%20sobre%20las%20Gift%20Cards%20Todo%20Vending"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Preguntar por WhatsApp"
                >
                  <Button variant="outline" className="gap-2">
                    <SiWhatsapp className="h-4 w-4" />
                    Preguntar por WhatsApp
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

// Una denominacion: tarjeta visual, precio, disponibilidad, cantidad y botones.
//
// Cuantas se pueden elegir sale de tres topes: el del producto (maxPorPedido),
// lo que aun cabe en el pedido (MAX_UNIDADES_POR_PEDIDO) y el stock que queda
// sin contar lo que ya esta en el carrito. Mientras el carrito o el stock no
// han cargado (SSR y primer render) los botones quedan deshabilitados: asi el
// HTML del servidor y el del cliente coinciden.
function TarjetaProducto({ producto }: { producto: Producto }) {
  const { cargado, items, agregar, disponiblePara } = useCarrito();
  const { cargado: stockCargado, conError: stockConError, stockDe } = useStock();
  const { toast } = useToast();
  const [, navegar] = useLocation();
  const [cantidad, setCantidad] = useState(1);

  const enCarrito = items.find((i) => i.productoId === producto.id)?.cantidad ?? 0;
  const stock = stockDe(producto.id);
  // Si no se pudo leer el stock se deja comprar igual: el checkout reserva los
  // codigos y responde "Sin stock" si no alcanzan.
  const listo = cargado && (stockCargado || stockConError);
  const sinStock = stock !== null && stock <= 0;
  const quedanSinCarrito = stock === null ? Infinity : Math.max(0, stock - enCarrito);
  const cabe = cargado ? disponiblePara(producto.id) : producto.maxPorPedido;
  const disponible = Math.min(cabe, quedanSinCarrito);
  const tope = Math.max(1, Math.min(producto.maxPorPedido, disponible));
  const puedeAgregar = listo && !sinStock && disponible > 0;

  useEffect(() => {
    if (cantidad > tope) setCantidad(tope);
  }, [cantidad, tope]);

  const irAlCarrito = () => navegar("/carrito");

  const accionVerCarrito = (
    <ToastAction altText="Ver carrito" onClick={irAlCarrito}>
      Ver carrito
    </ToastAction>
  );

  const agregarAlCarrito = () => {
    if (!puedeAgregar) return;
    const resultado = agregar(producto.id, Math.min(cantidad, disponible));
    if (resultado.agregadas === 0) {
      toast({
        title: "Tu carrito ya está completo",
        description: `El máximo es de ${MAX_UNIDADES_POR_PEDIDO} unidades por pedido.`,
        action: accionVerCarrito,
      });
      return;
    }
    const agregadas = textoUnidades(resultado.agregadas, "Gift Card", "Gift Cards");
    toast({
      title: "Agregado al carrito",
      description: resultado.limitado
        ? `Solo cabían ${agregadas}: el máximo es de ${MAX_UNIDADES_POR_PEDIDO} unidades por pedido.`
        : `${agregadas} de ${formatoUsd(producto.precioUsd)}.`,
      action: accionVerCarrito,
    });
    setCantidad(1);
  };

  const comprarAhora = () => {
    if (!listo || sinStock) return;
    if (disponible > 0) agregar(producto.id, Math.min(cantidad, disponible));
    irAlCarrito();
  };

  // Aviso bajo el selector cuando ya no se puede agregar mas de este monto.
  let aviso: string | null = null;
  if (listo && !sinStock && disponible === 0) {
    aviso =
      cabe === 0
        ? `Ya tienes en tu carrito el máximo de ${MAX_UNIDADES_POR_PEDIDO} unidades por pedido.`
        : "Ya tienes en tu carrito todas las disponibles de este monto.";
  }

  let estado: string;
  if (!stockCargado && !stockConError) estado = "Consultando disponibilidad...";
  else if (stockConError) estado = "No pudimos consultar la disponibilidad";
  else if (sinStock) estado = "Sin stock por ahora";
  else if (stock !== null && stock <= 5) estado = stock === 1 ? "¡Queda 1!" : `¡Quedan ${stock}!`;
  else estado = "Disponible";

  const testId = `gift-card-${producto.id}`;

  return (
    <Card className="h-full flex flex-col" data-testid={testId}>
      <CardContent className="p-6 flex flex-col gap-5 flex-1">
        <div className="relative">
          <GiftCardVisual
            montoUsd={producto.precioUsd}
            tamano="md"
            className={cn(sinStock && "grayscale opacity-70")}
          />
          {/* El Badge trae "hover-elevate", que lo fuerza a position: relative:
              por eso se posiciona el contenedor y no el Badge. */}
          {sinStock && (
            <span className="absolute top-3 left-3">
              <Badge variant="destructive" className="shadow-md" data-testid={`${testId}-sin-stock`}>
                Sin stock
              </Badge>
            </span>
          )}
        </div>

        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="font-semibold text-lg text-foreground leading-snug">{producto.nombre}</h2>
            <p
              className={cn("text-sm", sinStock ? "text-destructive font-medium" : "text-muted-foreground")}
              role="status"
              data-testid={`${testId}-estado`}
            >
              {estado}
            </p>
          </div>
          <p className="text-2xl font-bold text-foreground tabular-nums whitespace-nowrap">
            {formatoUsd(producto.precioUsd)}
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <SelectorCantidad
            valor={cantidad}
            max={tope}
            onCambiar={setCantidad}
            etiqueta={`Cantidad de ${producto.nombre}`}
            deshabilitado={!puedeAgregar}
            testId={`selector-cantidad-${producto.id}`}
          />
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Subtotal</p>
            <p className="text-lg font-bold text-foreground tabular-nums">
              {formatoUsd(redondearUsd(producto.precioUsd * cantidad))}
            </p>
          </div>
        </div>

        {aviso && (
          <p className="flex items-start gap-2 text-sm text-muted-foreground" role="status">
            <Info className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
            {aviso}
          </p>
        )}

        <div className="mt-auto flex flex-col gap-3">
          {sinStock ? (
            <Button type="button" size="lg" variant="outline" disabled data-testid={`button-sin-stock-${producto.id}`}>
              Sin stock
            </Button>
          ) : (
            <>
              <Button
                type="button"
                size="lg"
                className="gap-2 glow-primary"
                onClick={comprarAhora}
                disabled={!listo}
                data-testid={`button-comprar-ahora-${producto.id}`}
              >
                Comprar ahora
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                size="lg"
                variant="outline"
                className="gap-2"
                onClick={agregarAlCarrito}
                disabled={!puedeAgregar}
                data-testid={`button-agregar-carrito-${producto.id}`}
              >
                <ShoppingCart className="h-4 w-4" />
                Agregar al carrito
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
