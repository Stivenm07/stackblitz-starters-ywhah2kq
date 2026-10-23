import type { Config, Context } from "@netlify/functions";
import { and, asc, eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import { appointments } from "../../db/schema.js";
import { afiliadoActual, noAutorizado } from "../../server/auth.js";
import { CATALOGO_CITAS } from "../../server/patient.js";

// Citas iniciales de demostración para el afiliado la primera vez que consulta su agenda.
const CITAS_INICIALES = [
  { especialidad: "Nutrición y Dietética", medico: "Nut. Alejandra Pardo", sede: "IPS MediGestión Salitre", modalidad: "Presencial", fecha: "2026-10-27", hora: "09:40", motivo: "Plan nutricional — programa cardiovascular" },
  { especialidad: "Odontología General", medico: "Dra. Camila Restrepo", sede: "IPS MediGestión Kennedy", modalidad: "Presencial", fecha: "2026-11-04", hora: "14:40", motivo: "Control y profilaxis semestral" },
  { especialidad: "Psicología", medico: "Ps. Carolina Duarte", sede: "Telemedicina", modalidad: "Virtual", fecha: "2026-11-12", hora: "16:00", motivo: "Manejo del estrés laboral" },
];

export default async (req: Request, context: Context) => {
  const cedula = await afiliadoActual(context);
  if (!cedula) return noAutorizado();

  if (req.method === "GET") {
    let rows = await db.select().from(appointments).where(eq(appointments.cedula, cedula)).orderBy(asc(appointments.fecha), asc(appointments.hora));
    if (rows.length === 0) {
      await db.insert(appointments).values(CITAS_INICIALES.map((c) => ({ ...c, cedula })));
      rows = await db.select().from(appointments).where(eq(appointments.cedula, cedula)).orderBy(asc(appointments.fecha), asc(appointments.hora));
    }
    return Response.json(rows);
  }

  if (req.method === "POST") {
    const b = await req.json().catch(() => ({}));
    const medicos = CATALOGO_CITAS.especialidades[b.especialidad];
    if (!medicos || !medicos.includes(b.medico) || !CATALOGO_CITAS.sedes.includes(b.sede) || !CATALOGO_CITAS.horas.includes(b.hora)) {
      return Response.json({ error: "Datos de la cita inválidos." }, { status: 400 });
    }
    const hoy = new Date().toISOString().slice(0, 10);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(b.fecha ?? "") || b.fecha <= hoy) {
      return Response.json({ error: "Seleccione una fecha posterior a hoy." }, { status: 400 });
    }
    const [ocupada] = await db.select().from(appointments).where(and(
      eq(appointments.medico, b.medico), eq(appointments.fecha, b.fecha), eq(appointments.hora, b.hora), eq(appointments.estado, "Programada"),
    ));
    if (ocupada) return Response.json({ error: "Ese horario ya no está disponible. Elija otra hora." }, { status: 409 });

    const [cita] = await db.insert(appointments).values({
      cedula,
      especialidad: b.especialidad,
      medico: b.medico,
      sede: b.sede,
      modalidad: b.sede === "Telemedicina" ? "Virtual" : "Presencial",
      fecha: b.fecha,
      hora: b.hora,
      motivo: String(b.motivo ?? "").slice(0, 500),
    }).returning();
    return Response.json(cita, { status: 201 });
  }

  if (req.method === "PATCH") {
    const id = Number(context.params.id);
    const b = await req.json().catch(() => ({}));
    const cambios: Partial<typeof appointments.$inferInsert> = {};
    if (b.accion === "cancelar") cambios.estado = "Cancelada";
    else if (b.accion === "confirmar") cambios.estado = "Confirmada";
    else if (b.accion === "reprogramar" && CATALOGO_CITAS.horas.includes(b.hora) && /^\d{4}-\d{2}-\d{2}$/.test(b.fecha ?? "")) {
      cambios.fecha = b.fecha;
      cambios.hora = b.hora;
      cambios.estado = "Programada";
    } else return Response.json({ error: "Acción no válida." }, { status: 400 });

    const [cita] = await db.update(appointments).set(cambios)
      .where(and(eq(appointments.id, id), eq(appointments.cedula, cedula))).returning();
    if (!cita) return Response.json({ error: "Cita no encontrada." }, { status: 404 });
    return Response.json(cita);
  }

  return new Response("Method not allowed", { status: 405 });
};

export const config: Config = { path: ["/api/citas", "/api/citas/:id"] };
