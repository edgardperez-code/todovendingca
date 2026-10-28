// Llamadas del panel /admin al servidor. Todas llevan la cabecera x-admin-key.
//
// La clave se guarda en sessionStorage (no en localStorage): se borra sola al
// cerrar la pestana o el navegador, asi que no queda en un equipo compartido.
// Nunca se imprime en consola ni se manda en la URL.

const CLAVE_SESION = "tv-admin-clave";

export function leerClaveGuardada(): string | null {
  try {
    const valor = window.sessionStorage.getItem(CLAVE_SESION);
    return valor && valor.length > 0 ? valor : null;
  } catch {
    // Almacenamiento bloqueado: se pide la clave en cada carga.
    return null;
  }
}

export function guardarClave(clave: string): void {
  try {
    window.sessionStorage.setItem(CLAVE_SESION, clave);
  } catch {
    // Sin sessionStorage el panel funciona igual hasta recargar la pagina.
  }
}

export function borrarClave(): void {
  try {
    window.sessionStorage.removeItem(CLAVE_SESION);
  } catch {
    // Nada que borrar.
  }
}

// Error de una llamada admin. `estado` es el HTTP (0 si no hubo respuesta).
export class ErrorAdmin extends Error {
  readonly estado: number;

  constructor(mensaje: string, estado: number) {
    super(mensaje);
    this.name = "ErrorAdmin";
    this.estado = estado;
  }

  get noAutorizado(): boolean {
    return this.estado === 401;
  }

  get limite(): boolean {
    return this.estado === 429;
  }
}

export const MENSAJE_LIMITE =
  "Demasiados intentos fallidos desde tu red. Espera unos minutos antes de volver a intentarlo.";

function mensajeDe(cuerpo: unknown): string | null {
  if (typeof cuerpo !== "object" || cuerpo === null) return null;
  const error = (cuerpo as Record<string, unknown>).error;
  return typeof error === "string" && error.length > 0 ? error : null;
}

// fetch con la clave. Devuelve el cuerpo JSON si la respuesta es 2xx con
// ok: true; si no, lanza ErrorAdmin con un mensaje que se puede mostrar.
export async function pedirAdmin<T>(
  clave: string,
  ruta: string,
  opciones: { metodo?: "GET" | "POST"; cuerpo?: unknown } = {},
): Promise<T> {
  const metodo = opciones.metodo ?? "GET";
  const cabeceras: Record<string, string> = { "x-admin-key": clave };
  if (opciones.cuerpo !== undefined) cabeceras["Content-Type"] = "application/json";

  let respuesta: Response;
  try {
    respuesta = await fetch(ruta, {
      method: metodo,
      headers: cabeceras,
      body: opciones.cuerpo !== undefined ? JSON.stringify(opciones.cuerpo) : undefined,
      credentials: "same-origin",
      cache: "no-store",
    });
  } catch {
    throw new ErrorAdmin("No pudimos conectar con el servidor. Revisa tu conexión.", 0);
  }

  let cuerpo: unknown = null;
  try {
    cuerpo = await respuesta.json();
  } catch {
    cuerpo = null;
  }

  if (respuesta.status === 401) {
    throw new ErrorAdmin("La clave de administrador no es válida o ya no está vigente.", 401);
  }
  if (respuesta.status === 429) {
    throw new ErrorAdmin(MENSAJE_LIMITE, 429);
  }
  const ok =
    respuesta.ok && typeof cuerpo === "object" && cuerpo !== null && (cuerpo as { ok?: unknown }).ok === true;
  if (!ok) {
    throw new ErrorAdmin(
      mensajeDe(cuerpo) ?? `El servidor respondió con un error (HTTP ${respuesta.status}).`,
      respuesta.status,
    );
  }
  return cuerpo as T;
}

// Arma "?a=1&b=2" omitiendo los valores vacios.
export function consulta(parametros: Record<string, string | number | null | undefined>): string {
  const p = new URLSearchParams();
  for (const [nombre, valor] of Object.entries(parametros)) {
    if (valor === null || valor === undefined || valor === "") continue;
    p.set(nombre, String(valor));
  }
  const texto = p.toString();
  return texto ? `?${texto}` : "";
}
