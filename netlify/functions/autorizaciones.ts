import type { Config, Context } from "@netlify/functions";
import { desc, eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import { authorizationRequests } from "../../db/schema.js";
import { afiliadoActual, noAutorizado } from "../../server/auth.js";

export default async (req: Request, context: Context) => {
  const cedula = await afiliadoActual(context);
  if (!cedula) return noAutorizado();

  if (req.method === "GET") {
    const rows = await db.select().from(authorizationRequests)
      .where(eq(authorizationRequests.cedula, cedula)).orderBy(desc(authorizationRequests.createdAt));
    return Response.json(rows);
  }

  if (req.method === "POST") {
    const b = await req.json().catch(() => ({}));
    const servicio = String(b.servicio ?? "").trim();
    const ordenadoPor = String(b.ordenadoPor ?? "").trim();
    if (servicio.length < 3 || ordenadoPor.length < 3) {
      return Response.json({ error: "Indique el servicio y el profesional que lo ordenó." }, { status: 400 });
    }
    const [row] = await db.insert(authorizationRequests).values({
      numero: `SOL-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`,
      cedula,
      servicio: servicio.slice(0, 200),
      ordenadoPor: ordenadoPor.slice(0, 120),
      observaciones: String(b.observaciones ?? "").slice(0, 1000),
    }).returning();
    return Response.json(row, { status: 201 });
  }

  return new Response("Method not allowed", { status: 405 });
};

export const config: Config = { path: "/api/autorizaciones" };
