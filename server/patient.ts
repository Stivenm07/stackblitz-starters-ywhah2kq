// Información clínica FICTICIA usada como demostración del portal MediGestión EPS.
// Ningún dato corresponde a una persona real.

export const PACIENTES: Record<string, ReturnType<typeof expediente>> = {};

function expediente() {
  return {
    afiliado: {
      cedula: "1016949556",
      tipoDocumento: "CC",
      nombres: "Daniel Esteban",
      apellidos: "Rojas Medina",
      fechaNacimiento: "1994-03-14",
      sexo: "Masculino",
      grupoSanguineo: "O+",
      estadoCivil: "Unión libre",
      ocupacion: "Analista de sistemas",
      telefono: "+57 310 482 7719",
      correo: "daniel.rojas@correo-ficticio.co",
      direccion: "Cra. 68D # 24A-51, Apto 402",
      ciudad: "Bogotá D.C.",
      regimen: "Contributivo",
      tipoAfiliado: "Cotizante",
      categoria: "B",
      estadoAfiliacion: "Activo",
      fechaAfiliacion: "2016-02-01",
      numeroCarnet: "MG-2016-0049556",
      ipsPrimaria: "IPS MediGestión Salitre",
      medicoFamiliar: "Dra. Laura Catalina Prieto",
      empleador: "Soluciones Digitales Andinas S.A.S.",
      semanasCotizadas: 524,
      contactoEmergencia: { nombre: "María Fernanda Gómez", parentesco: "Compañera permanente", telefono: "+57 315 220 1984" },
    },
    beneficiarios: [
      { nombre: "María Fernanda Gómez Ríos", documento: "CC 1022334455", parentesco: "Compañera permanente", edad: 30, estado: "Activo" },
      { nombre: "Samuel Rojas Gómez", documento: "RC 1011223344", parentesco: "Hijo", edad: 4, estado: "Activo" },
    ],
    resumenClinico: {
      alergias: [
        { sustancia: "Penicilina", reaccion: "Urticaria generalizada y angioedema leve", severidad: "Alta", registrada: "2009-07-22" },
        { sustancia: "Ácaros del polvo", reaccion: "Rinitis y estornudos", severidad: "Leve", registrada: "2015-04-10" },
      ],
      diagnosticos: [
        { cie10: "J45.0", descripcion: "Asma predominantemente alérgica", estado: "Controlado", desde: "2008-05-02" },
        { cie10: "E78.0", descripcion: "Hipercolesterolemia pura", estado: "En seguimiento", desde: "2024-11-18" },
        { cie10: "K21.9", descripcion: "Enfermedad por reflujo gastroesofágico sin esofagitis", estado: "Controlado", desde: "2022-02-09" },
        { cie10: "M54.5", descripcion: "Lumbago no especificado", estado: "Resuelto", desde: "2025-06-03" },
      ],
      antecedentes: {
        personales: ["Asma desde la infancia", "Fractura de radio distal izquierdo (2011)", "Varicela en la infancia"],
        quirurgicos: ["Apendicectomía laparoscópica (2013) — Clínica Central, sin complicaciones"],
        familiares: ["Padre: hipertensión arterial y diabetes mellitus tipo 2", "Madre: hipotiroidismo", "Abuelo paterno: infarto agudo de miocardio a los 62 años"],
        habitos: ["No fumador", "Consumo social de alcohol (1-2 veces/mes)", "Actividad física: ciclismo 3 veces por semana", "Sueño: 6-7 horas/noche"],
      },
      riesgoCardiovascular: { puntaje: "Bajo (4,2 % a 10 años)", calculado: "2026-08-12" },
    },
    signosVitales: [
      { fecha: "2025-10-14", peso: 82.4, talla: 1.76, pas: 128, pad: 84, fc: 76, spo2: 97, temp: 36.6 },
      { fecha: "2026-01-20", peso: 81.1, talla: 1.76, pas: 126, pad: 82, fc: 74, spo2: 98, temp: 36.5 },
      { fecha: "2026-03-28", peso: 80.0, talla: 1.76, pas: 124, pad: 80, fc: 72, spo2: 98, temp: 36.7 },
      { fecha: "2026-05-30", peso: 79.2, talla: 1.76, pas: 122, pad: 79, fc: 70, spo2: 98, temp: 36.4 },
      { fecha: "2026-08-12", peso: 78.3, talla: 1.76, pas: 120, pad: 78, fc: 68, spo2: 99, temp: 36.5 },
      { fecha: "2026-10-02", peso: 77.6, talla: 1.76, pas: 118, pad: 76, fc: 66, spo2: 99, temp: 36.6 },
    ],
    consultas: [
      {
        fecha: "2026-10-02", tipo: "Control", especialidad: "Medicina Interna", profesional: "Dr. Ricardo Alonso Beltrán",
        sede: "IPS MediGestión Salitre",
        motivo: "Control de perfil lipídico tras 6 meses de manejo farmacológico.",
        subjetivo: "Paciente refiere adherencia al tratamiento con atorvastatina, sin mialgias. Mantiene dieta baja en grasas saturadas y ciclismo 3 veces por semana.",
        objetivo: "PA 118/76 mmHg, FC 66 lpm, peso 77,6 kg, IMC 25,1. Ruidos cardiacos rítmicos sin soplos. Pulmones bien ventilados.",
        analisis: "Hipercolesterolemia con respuesta adecuada: LDL descendió de 172 a 118 mg/dL. Pérdida de 4,8 kg en el último año.",
        plan: "Continuar atorvastatina 20 mg/noche. Perfil lipídico y transaminasas en 6 meses. Refuerzo de hábitos saludables.",
        diagnosticos: ["E78.0 Hipercolesterolemia pura"],
      },
      {
        fecha: "2026-08-12", tipo: "Primera vez", especialidad: "Medicina General", profesional: "Dra. Laura Catalina Prieto",
        sede: "IPS MediGestión Salitre",
        motivo: "Valoración de riesgo cardiovascular y programa de promoción y prevención.",
        subjetivo: "Asintomático. Antecedente familiar de cardiopatía isquémica. Solicita chequeo general.",
        objetivo: "PA 120/78 mmHg, FC 68 lpm, SpO2 99 %. Examen físico sin hallazgos patológicos.",
        analisis: "Riesgo cardiovascular bajo según Framingham ajustado a Colombia. Asma controlada (ACT 23/25).",
        plan: "Laboratorios de control. Vacuna de influenza estacional. Remisión a medicina interna para seguimiento de dislipidemia.",
        diagnosticos: ["Z00.0 Examen médico general", "J45.0 Asma predominantemente alérgica"],
      },
      {
        fecha: "2026-05-30", tipo: "Control", especialidad: "Neumología", profesional: "Dra. Paola Andrea Suárez",
        sede: "Clínica MediGestión Norte",
        motivo: "Control anual de asma.",
        subjetivo: "Uso de salbutamol de rescate menos de 1 vez por semana. Sin despertares nocturnos. Leve rinitis en temporada de lluvias.",
        objetivo: "Espirometría: VEF1 92 % del predicho, relación VEF1/CVF 0,81. Sin sibilancias.",
        analisis: "Asma alérgica bien controlada, escalón 2 GINA.",
        plan: "Continuar budesonida/formoterol a demanda. Lavados nasales con solución salina. Control en 12 meses.",
        diagnosticos: ["J45.0 Asma predominantemente alérgica", "J30.3 Otras rinitis alérgicas"],
      },
      {
        fecha: "2026-03-28", tipo: "Consulta prioritaria", especialidad: "Medicina General", profesional: "Dr. Julián Mauricio Cárdenas",
        sede: "IPS MediGestión Kennedy",
        motivo: "Ardor retroesternal postprandial de 2 semanas de evolución.",
        subjetivo: "Pirosis después de comidas abundantes y café. Niega disfagia, pérdida de peso o sangrado.",
        objetivo: "Abdomen blando, depresible, leve dolor a la palpación en epigastrio. Sin signos de alarma.",
        analisis: "Reactivación de ERGE sin signos de alarma.",
        plan: "Omeprazol 20 mg en ayunas por 8 semanas. Medidas antirreflujo. Reconsultar si aparecen signos de alarma.",
        diagnosticos: ["K21.9 Enfermedad por reflujo gastroesofágico"],
      },
      {
        fecha: "2025-10-14", tipo: "Urgencias", especialidad: "Urgencias", profesional: "Dr. Felipe Andrés Ocampo",
        sede: "Clínica MediGestión Norte",
        motivo: "Lumbalgia aguda tras levantar objeto pesado.",
        subjetivo: "Dolor lumbar 7/10, sin irradiación, sin alteración de esfínteres.",
        objetivo: "Contractura paravertebral lumbar bilateral. Lasègue negativo. Fuerza y sensibilidad conservadas.",
        analisis: "Lumbago mecánico agudo sin signos de alarma neurológica.",
        plan: "Analgesia con acetaminofén + metocarbamol, calor local, 10 sesiones de terapia física. Incapacidad 3 días.",
        diagnosticos: ["M54.5 Lumbago no especificado"],
      },
    ],
    laboratorios: [
      {
        fecha: "2026-09-25", examen: "Perfil lipídico", laboratorio: "Laboratorio Clínico MediGestión", ordenadoPor: "Dr. Ricardo Alonso Beltrán", estado: "Disponible",
        resultados: [
          { parametro: "Colesterol total", valor: 188, unidad: "mg/dL", referencia: "< 200", estado: "normal" },
          { parametro: "Colesterol LDL", valor: 118, unidad: "mg/dL", referencia: "< 130", estado: "normal" },
          { parametro: "Colesterol HDL", valor: 46, unidad: "mg/dL", referencia: "> 40", estado: "normal" },
          { parametro: "Triglicéridos", valor: 162, unidad: "mg/dL", referencia: "< 150", estado: "alto" },
        ],
      },
      {
        fecha: "2026-09-25", examen: "Química sanguínea", laboratorio: "Laboratorio Clínico MediGestión", ordenadoPor: "Dr. Ricardo Alonso Beltrán", estado: "Disponible",
        resultados: [
          { parametro: "Glucosa en ayunas", valor: 92, unidad: "mg/dL", referencia: "70 - 99", estado: "normal" },
          { parametro: "Hemoglobina glicosilada", valor: 5.4, unidad: "%", referencia: "< 5,7", estado: "normal" },
          { parametro: "Creatinina", valor: 0.94, unidad: "mg/dL", referencia: "0,7 - 1,3", estado: "normal" },
          { parametro: "ALT (TGP)", valor: 31, unidad: "U/L", referencia: "< 41", estado: "normal" },
          { parametro: "AST (TGO)", valor: 27, unidad: "U/L", referencia: "< 40", estado: "normal" },
        ],
      },
      {
        fecha: "2026-08-15", examen: "Cuadro hemático", laboratorio: "Laboratorio Clínico MediGestión", ordenadoPor: "Dra. Laura Catalina Prieto", estado: "Disponible",
        resultados: [
          { parametro: "Hemoglobina", valor: 15.2, unidad: "g/dL", referencia: "13,5 - 17,5", estado: "normal" },
          { parametro: "Hematocrito", valor: 45.1, unidad: "%", referencia: "41 - 53", estado: "normal" },
          { parametro: "Leucocitos", valor: 7.8, unidad: "x10³/µL", referencia: "4,5 - 11", estado: "normal" },
          { parametro: "Eosinófilos", valor: 6.2, unidad: "%", referencia: "1 - 4", estado: "alto" },
          { parametro: "Plaquetas", valor: 268, unidad: "x10³/µL", referencia: "150 - 450", estado: "normal" },
        ],
      },
      {
        fecha: "2026-10-16", examen: "TSH y T4 libre", laboratorio: "Laboratorio Clínico MediGestión", ordenadoPor: "Dr. Ricardo Alonso Beltrán", estado: "En proceso",
        resultados: [],
      },
    ],
    imagenes: [
      { fecha: "2026-05-30", estudio: "Espirometría pre y post broncodilatador", sede: "Clínica MediGestión Norte", conclusion: "Función pulmonar normal. Respuesta broncodilatadora no significativa." },
      { fecha: "2026-03-04", estudio: "Radiografía de tórax PA y lateral", sede: "Centro de Imágenes MediGestión", conclusion: "Sin consolidaciones ni derrames. Silueta cardiaca de tamaño normal." },
      { fecha: "2025-10-20", estudio: "Radiografía de columna lumbosacra", sede: "Centro de Imágenes MediGestión", conclusion: "Rectificación de la lordosis lumbar. Sin lesiones óseas." },
    ],
    medicamentos: [
      { nombre: "Atorvastatina 20 mg", presentacion: "Tableta", dosis: "1 tableta cada noche", via: "Oral", inicio: "2024-11-18", prescriptor: "Dr. Ricardo Alonso Beltrán", proximaEntrega: "2026-10-28", entregasRestantes: 4, estado: "Activo", tipo: "Crónico" },
      { nombre: "Budesonida/Formoterol 160/4,5 µg", presentacion: "Inhalador", dosis: "1 inhalación a demanda (máx. 8/día)", via: "Inhalada", inicio: "2026-05-30", prescriptor: "Dra. Paola Andrea Suárez", proximaEntrega: "2026-11-05", entregasRestantes: 6, estado: "Activo", tipo: "Crónico" },
      { nombre: "Loratadina 10 mg", presentacion: "Tableta", dosis: "1 tableta al día en temporada de lluvias", via: "Oral", inicio: "2026-05-30", prescriptor: "Dra. Paola Andrea Suárez", proximaEntrega: "2026-10-24", entregasRestantes: 2, estado: "Activo", tipo: "Temporal" },
      { nombre: "Omeprazol 20 mg", presentacion: "Cápsula", dosis: "1 cápsula en ayunas", via: "Oral", inicio: "2026-03-28", prescriptor: "Dr. Julián Mauricio Cárdenas", proximaEntrega: null, entregasRestantes: 0, estado: "Finalizado", tipo: "Temporal" },
    ],
    entregasMedicamentos: [
      { fecha: "2026-09-28", medicamento: "Atorvastatina 20 mg x 30", farmacia: "Droguería MediGestión Salitre", estado: "Entregado" },
      { fecha: "2026-09-24", medicamento: "Loratadina 10 mg x 30", farmacia: "Droguería MediGestión Salitre", estado: "Entregado" },
      { fecha: "2026-09-05", medicamento: "Budesonida/Formoterol x 1", farmacia: "Droguería MediGestión Norte", estado: "Entregado" },
      { fecha: "2026-08-29", medicamento: "Atorvastatina 20 mg x 30", farmacia: "Domicilio", estado: "Entregado" },
    ],
    vacunas: [
      { vacuna: "Influenza estacional", dosis: "Anual", fecha: "2026-08-12", lote: "FLU26-0912", estado: "Aplicada" },
      { vacuna: "COVID-19 (refuerzo bivalente)", dosis: "Refuerzo 2", fecha: "2023-05-10", lote: "BV23-1188", estado: "Aplicada" },
      { vacuna: "Tétanos-difteria (Td)", dosis: "Refuerzo", fecha: "2019-02-21", lote: "TD19-4402", estado: "Aplicada" },
      { vacuna: "Hepatitis B", dosis: "Esquema completo (3)", fecha: "2012-09-03", lote: "HB12-7731", estado: "Aplicada" },
      { vacuna: "Tétanos-difteria (Td)", dosis: "Refuerzo decenal", fecha: "2029-02-21", lote: "—", estado: "Pendiente" },
      { vacuna: "Neumococo (PCV20)", dosis: "Única — recomendada por asma", fecha: "2026-11-15", lote: "—", estado: "Pendiente" },
    ],
    autorizaciones: [
      { numero: "AUT-2026-118402", servicio: "Perfil lipídico + química sanguínea", prestador: "Laboratorio Clínico MediGestión", fecha: "2026-09-20", vigencia: "2026-12-19", estado: "Utilizada" },
      { numero: "AUT-2026-120977", servicio: "Consulta de control — Medicina Interna", prestador: "IPS MediGestión Salitre", fecha: "2026-08-12", vigencia: "2026-11-10", estado: "Utilizada" },
      { numero: "AUT-2026-131554", servicio: "Ecografía abdominal total", prestador: "Centro de Imágenes MediGestión", fecha: "2026-10-02", vigencia: "2026-12-31", estado: "Aprobada" },
      { numero: "AUT-2026-131555", servicio: "TSH y T4 libre", prestador: "Laboratorio Clínico MediGestión", fecha: "2026-10-02", vigencia: "2026-12-31", estado: "Utilizada" },
    ],
    incapacidades: [
      { numero: "INC-2025-55120", desde: "2025-10-14", hasta: "2025-10-16", dias: 3, origen: "Enfermedad general", diagnostico: "M54.5 Lumbago", estado: "Transcrita" },
    ],
    historialCitas: [
      { fecha: "2026-10-02", hora: "08:20", especialidad: "Medicina Interna", medico: "Dr. Ricardo Alonso Beltrán", sede: "IPS MediGestión Salitre", estado: "Atendida" },
      { fecha: "2026-08-12", hora: "07:00", especialidad: "Medicina General", medico: "Dra. Laura Catalina Prieto", sede: "IPS MediGestión Salitre", estado: "Atendida" },
      { fecha: "2026-07-03", hora: "15:40", especialidad: "Odontología General", medico: "Dr. Mateo Sánchez Luna", sede: "IPS MediGestión Kennedy", estado: "Inasistencia" },
      { fecha: "2026-05-30", hora: "10:00", especialidad: "Neumología", medico: "Dra. Paola Andrea Suárez", sede: "Clínica MediGestión Norte", estado: "Atendida" },
      { fecha: "2026-03-28", hora: "11:15", especialidad: "Medicina General", medico: "Dr. Julián Mauricio Cárdenas", sede: "IPS MediGestión Kennedy", estado: "Atendida" },
    ],
    programas: [
      { nombre: "Programa de Riesgo Cardiovascular", descripcion: "Seguimiento de perfil lipídico, presión arterial y hábitos saludables.", progreso: 70, proximaActividad: "Taller de alimentación saludable — 2026-11-08" },
      { nombre: "Programa Respira Bien (Asma)", descripcion: "Educación en uso de inhaladores y control de desencadenantes.", progreso: 85, proximaActividad: "Control de neumología — 2027-05" },
      { nombre: "Crecimiento y desarrollo (Samuel)", descripcion: "Controles del menor beneficiario.", progreso: 60, proximaActividad: "Control pediátrico — 2026-11-20" },
    ],
  };
}

PACIENTES["1016949556"] = expediente();

export const CATALOGO_CITAS = {
  especialidades: {
    "Medicina General": ["Dra. Laura Catalina Prieto", "Dr. Julián Mauricio Cárdenas", "Dra. Valentina Ospina"],
    "Medicina Interna": ["Dr. Ricardo Alonso Beltrán", "Dra. Natalia Herrera"],
    "Neumología": ["Dra. Paola Andrea Suárez"],
    "Odontología General": ["Dr. Mateo Sánchez Luna", "Dra. Camila Restrepo"],
    "Pediatría": ["Dra. Juliana Castaño", "Dr. Andrés Villamil"],
    "Ginecología": ["Dra. Sofía Moreno Peña"],
    "Psicología": ["Ps. Carolina Duarte", "Ps. Esteban Lozano"],
    "Nutrición y Dietética": ["Nut. Alejandra Pardo"],
    "Dermatología": ["Dr. Sebastián Arango"],
    "Optometría": ["Opt. Daniela Fuentes"],
    "Fisioterapia": ["Ft. Manuel Cifuentes"],
  } as Record<string, string[]>,
  sedes: ["IPS MediGestión Salitre", "IPS MediGestión Kennedy", "Clínica MediGestión Norte", "IPS MediGestión Suba", "Telemedicina"],
  horas: ["07:00", "07:40", "08:20", "09:00", "09:40", "10:20", "11:00", "14:00", "14:40", "15:20", "16:00", "16:40"],
};
