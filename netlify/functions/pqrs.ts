import type { Config, Context } from "@netlify/functions";
import { desc, eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import { pqrs } from "../../db/schema.js";
import { afiliadoActual, noAutorizado } from "../../server/auth.js";

const TIPOS = ["Petición", "Queja", "Reclamo", "Sugerencia", "Felicitación"];

const PQRS_INICIAL = {
  radicado: "PQRS-2026-004812",
  tipo: "Reclamo",
  categoria: "Entrega de medicamentos",
  asunto: "Demora en entrega de atorvastatina",
  descripcion: "La droguería no tenía disponibilidad del medicamento y no se generó pendiente.",
  canalRespuesta: "Correo electrónico",
  estado: "Cerrada",
  respuesta: "Se realizó la entrega a domicilio el 29/08/2026 y se reforzó el protocolo de pendientes en la droguería. Agradecemos su reporte.",
  createdAt: new Date("2026-08-26T10:15:00-05:00"),
};

export default async (req: Request, context: Context) => {
  const cedula = await afiliadoActual(context);
  if (!cedula) return noAutorizado();

  if (req.method === "GET") {
    let rows = await db.select().from(pqrs).where(eq(pqrs.cedula, cedula)).orderBy(desc(pqrs.createdAt));
    if (rows.length === 0) {
      await db.insert(pqrs).values({ ...PQRS_INICIAL, cedula }).onConflictDoNothing();
      rows = await db.select().from(pqrs).where(eq(pqrs.cedula, cedula)).orderBy(desc(pqrs.createdAt));
    }
    return Response.json(rows);
  }

  if (req.method === "POST") {
    const b = await req.json().catch(() => ({}));
    const asunto = String(b.asunto ?? "").trim();
    const descripcion = String(b.descripcion ?? "").trim();
    if (!TIPOS.includes(b.tipo) || !b.categoria || asunto.length < 5 || descripcion.length < 20) {
      return Response.json({ error: "Complete todos los campos (la descripción debe tener al menos 20 caracteres)." }, { status: 400 });
    }
    const radicado = `PQRS-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 10)}`;
    const [row] = await db.insert(pqrs).values({
      radicado,
      cedula,
      tipo: b.tipo,
      categoria: String(b.categoria).slice(0, 100),
      asunto: asunto.slice(0, 150),
      descripcion: descripcion.slice(0, 3000),
      canalRespuesta: String(b.canalRespuesta ?? "Correo electrónico").slice(0, 50),
    }).returning();
    return Response.json(row, { status: 201 });
  }

  return new Response("Method not allowed", { status: 405 });
};

export const config: Config = { path: "/api/pqrs" };
