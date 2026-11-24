// Estilos del blog (/blog y /blog/:slug) con los tokens del diseño Vitrina
// (--tinta, --linea, --naranja, --azul…). Igual que <EstilosSubpagina />: CSS
// normal dentro de un <style>, con clases "vb-*", para no tocar index.css.
const CSS_BLOG = `
.vb-hero{padding-block:clamp(36px,6vw,80px) clamp(28px,4vw,48px)}
.vb-hero .v-lead{margin-top:22px;max-width:62ch}
.vb-filtros{display:flex;flex-wrap:wrap;gap:8px;margin-top:28px}
.vb-filtro{font:500 12px/1 var(--font-mono);letter-spacing:.08em;text-transform:uppercase;padding:10px 14px;border-radius:999px;border:1.5px solid var(--linea);background:transparent;color:var(--tinta2);cursor:pointer}
.vb-filtro[aria-pressed="true"]{background:var(--tinta);border-color:var(--tinta);color:var(--papel)}
.vb-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,320px),1fr));gap:clamp(16px,2vw,28px);margin:0;padding:0;list-style:none}
.vb-card{display:flex;flex-direction:column;height:100%;border:1px solid var(--linea);border-radius:20px;overflow:hidden;background:var(--papel);color:var(--tinta);text-decoration:none;transition:transform .2s,box-shadow .2s}
.vb-card:hover{transform:translateY(-4px);box-shadow:0 30px 50px -36px rgba(var(--sombra-rgb),.55)}
.vb-card:focus-visible{outline:3px solid var(--azul);outline-offset:3px}
.vb-card__img{aspect-ratio:1200/630;width:100%;object-fit:cover;background:rgba(127,127,127,.15)}
.vb-card__ph{aspect-ratio:1200/630;display:grid;place-items:center;background:linear-gradient(135deg,var(--naranja),var(--azul));color:#fff;font:800 clamp(1.4rem,3vw,2rem)/1 var(--font-display,inherit);letter-spacing:-.03em;padding:24px;text-align:center}
.vb-card__c{display:flex;flex-direction:column;gap:10px;padding:20px 22px 24px;flex:1}
.vb-cat{font:500 11.5px/1.2 var(--font-mono);letter-spacing:.12em;text-transform:uppercase;color:var(--naranja-texto,var(--naranja))}
.vb-card h2{font-size:1.25rem;line-height:1.2;letter-spacing:-.02em;margin:0}
.vb-card p{margin:0;color:var(--tinta2);font-size:15px;line-height:1.55}
.vb-meta{margin-top:auto;padding-top:8px;font:500 12px/1.3 var(--font-mono);color:var(--tinta2);letter-spacing:.04em}
.vb-vacio{border:1.5px dashed var(--linea);border-radius:20px;padding:48px 24px;text-align:center;color:var(--tinta2)}

.vb-art{padding-block:clamp(28px,5vw,64px) clamp(40px,5vw,72px)}
.vb-migas{display:flex;flex-wrap:wrap;gap:8px;font:500 12px/1.3 var(--font-mono);letter-spacing:.06em;color:var(--tinta2);margin:0 0 22px;padding:0;list-style:none}
.vb-migas a{color:inherit}
.vb-migas li+li::before{content:"/";margin-right:8px;opacity:.6}
.vb-art__h1{font-size:clamp(2rem,4.6vw,3.4rem);max-width:22ch;overflow-wrap:break-word}
.vb-art__lead{margin-top:18px;max-width:64ch}
.vb-art__meta{display:flex;flex-wrap:wrap;gap:8px 18px;margin-top:22px;font:500 12.5px/1.3 var(--font-mono);color:var(--tinta2)}
.vb-art__img{width:100%;aspect-ratio:1200/630;object-fit:cover;border-radius:22px;margin-top:clamp(24px,4vw,44px);border:1px solid var(--linea)}
.vb-cuerpo{display:grid;grid-template-columns:minmax(0,1fr) 260px;gap:clamp(28px,5vw,72px);margin-top:clamp(28px,4vw,48px);align-items:start}
.vb-indice{position:sticky;top:110px;border:1px solid var(--linea);border-radius:18px;padding:18px 20px}
.vb-indice p{margin:0 0 10px;font:500 11.5px/1.2 var(--font-mono);letter-spacing:.12em;text-transform:uppercase;color:var(--tinta2)}
.vb-indice ol{margin:0;padding-left:18px;display:grid;gap:8px;font-size:14px;line-height:1.4}
.vb-indice a{color:var(--tinta);text-decoration:none}
.vb-indice a:hover{color:var(--azul);text-decoration:underline}
.vb-prosa{max-width:72ch;color:var(--tinta);font-size:clamp(1.02rem,1.2vw,1.1rem);line-height:1.75}
.vb-prosa>*:first-child{margin-top:0}
.vb-prosa h2,.vb-prosa h3,.vb-card h2{font-family:var(--font-display);font-weight:700}
.vb-prosa h2{font-size:clamp(1.5rem,2.4vw,1.9rem);line-height:1.2;letter-spacing:-.02em;margin:2.2em 0 .6em;scroll-margin-top:110px}
.vb-prosa h3{font-size:1.25rem;line-height:1.3;margin:1.8em 0 .5em}
.vb-prosa p,.vb-prosa ul,.vb-prosa ol,.vb-prosa table,.vb-prosa blockquote{margin:0 0 1.1em}
.vb-prosa ul,.vb-prosa ol{padding-left:1.3em}
.vb-prosa ul{list-style:disc}
.vb-prosa ol{list-style:decimal}
.vb-prosa li{margin:.35em 0}
.vb-prosa li::marker{color:var(--naranja)}
.vb-prosa a{color:var(--azul);text-underline-offset:3px}
.vb-prosa strong{font-weight:700}
.vb-prosa blockquote{border-left:4px solid var(--naranja);padding:.4em 0 .4em 1.1em;color:var(--tinta2);font-style:italic}
.vb-prosa img{max-width:100%;height:auto;border-radius:14px}
.vb-prosa code{font-family:var(--font-mono);font-size:.9em;background:rgba(127,127,127,.15);padding:.1em .35em;border-radius:6px}
.vb-prosa hr{border:0;border-top:1px solid var(--linea);margin:2.4em 0}
.vb-tabla{overflow-x:auto;margin:0 0 1.3em;border:1px solid var(--linea);border-radius:14px}
.vb-prosa table{width:100%;border-collapse:collapse;font-size:.95em;margin:0}
.vb-prosa th,.vb-prosa td{text-align:left;padding:10px 14px;border-bottom:1px solid var(--linea);vertical-align:top}
.vb-prosa th{background:rgba(242,106,33,.12);color:var(--tinta);font-weight:700}
.vb-prosa tr:last-child td{border-bottom:0}
.vb-etiquetas{display:flex;flex-wrap:wrap;gap:8px;margin-top:32px;padding:0;list-style:none}
.vb-etiquetas li{font:500 12px/1 var(--font-mono);padding:8px 12px;border-radius:999px;border:1px solid var(--linea);color:var(--tinta2)}
.vb-cargando{min-height:50vh;display:grid;place-items:center;color:var(--tinta2);font:500 13px/1 var(--font-mono)}
@media (max-width:999px){
  .vb-cuerpo{grid-template-columns:minmax(0,1fr)}
  .vb-indice{position:static;order:-1}
}
`;

export function EstilosBlog() {
  return <style dangerouslySetInnerHTML={{ __html: CSS_BLOG }} />;
}

// "21 de noviembre de 2026", con la zona de Venezuela fija para que el servidor
// y el navegador escriban lo mismo (si no, la hidratacion no coincide).
export function fechaLarga(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("es-VE", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "America/Caracas",
  });
}
