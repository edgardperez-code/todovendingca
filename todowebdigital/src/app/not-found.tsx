import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";

export default function NotFound() {
  return (
    <>
    <Header />
    <main id="contenido" className="flex-1">
    <section className="container-x flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <span className="eyebrow">Error 404</span>
      <h1 className="font-display mt-4 text-4xl font-extrabold text-ink-900 sm:text-5xl">Esta página no existe</h1>
      <p className="mt-4 max-w-md text-ink-600">Puede que el enlace esté mal escrito o que la página haya cambiado de lugar con el nuevo dominio.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/" className="btn-primary">Ir al inicio <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link>
        <Link href="/blog" className="btn-secondary">Ver el blog</Link>
        <Link href="/contacto" className="btn-secondary">Contacto</Link>
      </div>
    </section>
    </main>
    <Footer />
    </>
  );
}
