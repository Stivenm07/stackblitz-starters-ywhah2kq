import type { Config, Context } from "@netlify/functions";
import { afiliadoActual, noAutorizado } from "../../server/auth.js";
import { CATALOGO_CITAS, PACIENTES } from "../../server/patient.js";

export default async (_req: Request, context: Context) => {
  const cedula = await afiliadoActual(context);
  if (!cedula) return noAutorizado();
  return Response.json({ ...PACIENTES[cedula], catalogo: CATALOGO_CITAS });
};

export const config: Config = { path: "/api/paciente", method: "GET" };
