import type { Config, Context } from "@netlify/functions";
import { afiliadoActual, cerrarSesion, credencialesValidas, crearSesion } from "../../server/auth.js";
import { PACIENTES } from "../../server/patient.js";

export default async (req: Request, context: Context) => {
  const accion = context.params.accion;

  if (accion === "login" && req.method === "POST") {
    const { cedula, clave } = await req.json().catch(() => ({}));
    const cc = String(cedula ?? "").trim();
    if (!credencialesValidas(cc, String(clave ?? ""))) {
      return Response.json({ error: "Número de documento o contraseña incorrectos." }, { status: 401 });
    }
    await crearSesion(cc, context);
    return Response.json({ ok: true });
  }

  if (accion === "logout" && req.method === "POST") {
    await cerrarSesion(context);
    return Response.json({ ok: true });
  }

  if (accion === "me" && req.method === "GET") {
    const cedula = await afiliadoActual(context);
    if (!cedula) return Response.json({ autenticado: false }, { status: 401 });
    const { nombres, apellidos } = PACIENTES[cedula].afiliado;
    return Response.json({ autenticado: true, cedula, nombre: `${nombres} ${apellidos}` });
  }

  return new Response("Not found", { status: 404 });
};

export const config: Config = { path: "/api/auth/:accion" };
