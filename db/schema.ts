import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const sessions = pgTable("sessions", {
  token: text().primaryKey(),
  cedula: text().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at").notNull(),
});

export const appointments = pgTable("appointments", {
  id: serial().primaryKey(),
  cedula: text().notNull(),
  especialidad: text().notNull(),
  medico: text().notNull(),
  sede: text().notNull(),
  modalidad: text().notNull().default("Presencial"),
  fecha: text().notNull(),
  hora: text().notNull(),
  motivo: text().notNull().default(""),
  estado: text().notNull().default("Programada"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const pqrs = pgTable("pqrs", {
  id: serial().primaryKey(),
  radicado: text().notNull().unique(),
  cedula: text().notNull(),
  tipo: text().notNull(),
  categoria: text().notNull(),
  asunto: text().notNull(),
  descripcion: text().notNull(),
  canalRespuesta: text("canal_respuesta").notNull().default("Correo electrónico"),
  estado: text().notNull().default("Radicada"),
  respuesta: text(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const authorizationRequests = pgTable("authorization_requests", {
  id: serial().primaryKey(),
  numero: text().notNull().unique(),
  cedula: text().notNull(),
  servicio: text().notNull(),
  ordenadoPor: text("ordenado_por").notNull(),
  observaciones: text().notNull().default(""),
  estado: text().notNull().default("En estudio"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
