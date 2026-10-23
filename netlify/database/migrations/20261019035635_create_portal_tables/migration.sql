CREATE TABLE "appointments" (
	"id" serial PRIMARY KEY,
	"cedula" text NOT NULL,
	"especialidad" text NOT NULL,
	"medico" text NOT NULL,
	"sede" text NOT NULL,
	"modalidad" text DEFAULT 'Presencial' NOT NULL,
	"fecha" text NOT NULL,
	"hora" text NOT NULL,
	"motivo" text DEFAULT '' NOT NULL,
	"estado" text DEFAULT 'Programada' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "authorization_requests" (
	"id" serial PRIMARY KEY,
	"numero" text NOT NULL UNIQUE,
	"cedula" text NOT NULL,
	"servicio" text NOT NULL,
	"ordenado_por" text NOT NULL,
	"observaciones" text DEFAULT '' NOT NULL,
	"estado" text DEFAULT 'En estudio' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pqrs" (
	"id" serial PRIMARY KEY,
	"radicado" text NOT NULL UNIQUE,
	"cedula" text NOT NULL,
	"tipo" text NOT NULL,
	"categoria" text NOT NULL,
	"asunto" text NOT NULL,
	"descripcion" text NOT NULL,
	"canal_respuesta" text DEFAULT 'Correo electrónico' NOT NULL,
	"estado" text DEFAULT 'Radicada' NOT NULL,
	"respuesta" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"token" text PRIMARY KEY,
	"cedula" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"expires_at" timestamp NOT NULL
);
