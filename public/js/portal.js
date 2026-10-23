// Portal del afiliado — MediGestión EPS
const S = { p: null, citas: [], pqrs: [], solicitudes: [], view: "inicio", tab: {} };

const $ = (sel) => document.querySelector(sel);
const esc = (v) => String(v ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const MESES = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
const fecha = (iso) => { if (!iso) return "—"; const [y, m, d] = String(iso).slice(0, 10).split("-"); return `${+d} ${MESES[m - 1]} ${y}`; };
const hoyISO = () => new Date().toLocaleDateString("en-CA");
const edad = (iso) => { const n = new Date(iso), h = new Date(); let e = h.getFullYear() - n.getFullYear(); if (h < new Date(h.getFullYear(), n.getMonth(), n.getDate())) e--; return e; };

const ESTADO_PILL = {
  Programada: "p-info", Confirmada: "p-ok", Cancelada: "p-bad", Atendida: "p-ok", Inasistencia: "p-warn",
  Radicada: "p-info", "En trámite": "p-warn", Cerrada: "p-ok",
  Disponible: "p-ok", "En proceso": "p-warn", Activo: "p-ok", Finalizado: "p-muted", Entregado: "p-ok",
  Aplicada: "p-ok", Pendiente: "p-warn", Aprobada: "p-ok", Utilizada: "p-muted", "En estudio": "p-warn", Transcrita: "p-ok",
  Controlado: "p-ok", "En seguimiento": "p-warn", Resuelto: "p-muted", Alta: "p-bad", Leve: "p-warn",
};
const pill = (t) => `<span class="pill ${ESTADO_PILL[t] || "p-muted"}">${esc(t)}</span>`;

async function api(url, opts = {}) {
  const r = await fetch(url, { headers: { "Content-Type": "application/json" }, ...opts });
  if (r.status === 401) { location.replace("/"); throw new Error("Sesión expirada"); }
  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data.error || "Ocurrió un error. Intente de nuevo.");
  return data;
}

function toast(text, type = "ok") {
  const t = document.createElement("div");
  t.className = "toast " + type; t.textContent = text;
  $("#toasts").append(t); setTimeout(() => t.remove(), 4200);
}

function modal(html) {
  $("#modalRoot").innerHTML = `<div class="modal-bg" data-close><div class="modal">${html}</div></div>`;
  $("#modalRoot .modal-bg").onclick = (e) => { if (e.target.hasAttribute("data-close")) closeModal(); };
}
const closeModal = () => ($("#modalRoot").innerHTML = "");

// ================= NAVEGACIÓN =================
const NAV = [
  { group: "Principal" },
  { id: "inicio", ico: "🏠", label: "Inicio" },
  { id: "afiliacion", ico: "🪪", label: "Mi afiliación" },
  { group: "Mi salud" },
  { id: "historia", ico: "📋", label: "Historia clínica" },
  { id: "resultados", ico: "🧪", label: "Resultados" },
  { id: "medicamentos", ico: "💊", label: "Medicamentos" },
  { id: "programas", ico: "❤️", label: "Programas de salud" },
  { group: "Servicios" },
  { id: "citas", ico: "📅", label: "Citas médicas", badge: () => proximas().length },
  { id: "autorizaciones", ico: "✅", label: "Autorizaciones" },
  { id: "certificados", ico: "📄", label: "Certificados e incapacidades" },
  { id: "pqrs", ico: "💬", label: "PQRS" },
  { id: "red", ico: "🏥", label: "Red de atención" },
  { id: "ayuda", ico: "❓", label: "Ayuda" },
];

function renderNav() {
  $("#nav").innerHTML = NAV.map((n) => n.group
    ? `<div class="nav-label">${n.group}</div>`
    : `<button data-view="${n.id}" class="${S.view === n.id ? "active" : ""}"><span class="ico">${n.ico}</span>${n.label}${n.badge && n.badge() ? `<span class="badge">${n.badge()}</span>` : ""}</button>`
  ).join("");
  $("#nav").querySelectorAll("button").forEach((b) => (b.onclick = () => go(b.dataset.view)));
}

function go(view, tab) {
  S.view = view;
  if (tab) S.tab[view] = tab;
  history.replaceState(null, "", "#" + view);
  $("#sidebar").classList.remove("open");
  render();
  window.scrollTo({ top: 0 });
}

function render() {
  renderNav();
  const n = NAV.find((x) => x.id === S.view) || NAV[1];
  $("#crumb").textContent = n.label;
  $("#view").innerHTML = (VIEWS[S.view] || VIEWS.inicio)();
  bindView();
}

function tabs(view, list) {
  const cur = S.tab[view] || list[0][0];
  return { cur, html: `<div class="tabs">${list.map(([id, l]) => `<button data-tab="${view}:${id}" class="${cur === id ? "active" : ""}">${l}</button>`).join("")}</div>` };
}

const head = (t, sub, extra = "") => `<div class="section-head"><div><h1>${t}</h1><p>${sub}</p></div>${extra}</div>`;
const proximas = () => S.citas.filter((c) => c.fecha >= hoyISO() && c.estado !== "Cancelada" && c.estado !== "Atendida");

// ================= GRÁFICO SVG =================
function lineChart(series, labels, { min, max, h = 220, unit = "" } = {}) {
  const W = 640, H = h, pl = 40, pr = 16, pt = 18, pb = 30;
  const x = (i) => pl + (i * (W - pl - pr)) / Math.max(1, labels.length - 1);
  const y = (v) => pt + (1 - (v - min) / (max - min)) * (H - pt - pb);
  const ticks = 4, grid = [];
  for (let i = 0; i <= ticks; i++) {
    const v = min + ((max - min) * i) / ticks;
    grid.push(`<line class="grid-line" x1="${pl}" x2="${W - pr}" y1="${y(v)}" y2="${y(v)}"/><text class="axis" x="${pl - 8}" y="${y(v) + 4}" text-anchor="end">${Math.round(v)}</text>`);
  }
  const lines = series.map((s) => {
    const pts = s.data.map((v, i) => `${x(i)},${y(v)}`).join(" ");
    const last = s.data.length - 1;
    return `<polyline points="${pts}" fill="none" stroke="${s.color}" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>
      ${s.data.map((v, i) => `<circle cx="${x(i)}" cy="${y(v)}" r="${i === last ? 5 : 3.5}" fill="#fff" stroke="${s.color}" stroke-width="2.5"><title>${s.name}: ${v}${unit} · ${fecha(labels[i])}</title></circle>`).join("")}
      <text class="val-label" x="${x(last)}" y="${y(s.data[last]) - 10}" text-anchor="end">${s.data[last]}${unit}</text>`;
  }).join("");
  const xl = labels.map((l, i) => `<text class="axis" x="${x(i)}" y="${H - 8}" text-anchor="middle">${fecha(l).split(" ").slice(1).join(" ")}</text>`).join("");
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img">${grid.join("")}${lines}${xl}</svg>
    ${series.length > 1 ? `<div class="legend">${series.map((s) => `<span style="--c:${s.color}">${s.name}</span>`).join("")}</div>` : ""}`;
}

// ================= VISTAS =================
const VIEWS = {
  inicio() {
    const p = S.p, a = p.afiliado, prox = proximas(), sv = p.signosVitales.at(-1);
    const imc = (sv.peso / sv.talla ** 2).toFixed(1);
    const medsProx = p.medicamentos.filter((m) => m.proximaEntrega).sort((x, y) => x.proximaEntrega.localeCompare(y.proximaEntrega));
    const abiertas = S.pqrs.filter((q) => q.estado !== "Cerrada").length;
    return `
      <div class="welcome">
        <div>
          <h2>¡Hola, ${esc(a.nombres.split(" ")[0])}! 👋</h2>
          <p>Bienvenido a tu portal de salud. Tu afiliación se encuentra <b>activa</b> en régimen ${a.regimen}.</p>
          <div class="pill-row">
            <span class="pill">🩸 ${a.grupoSanguineo}</span>
            <span class="pill">🏥 ${a.ipsPrimaria}</span>
            <span class="pill">👩‍⚕️ ${a.medicoFamiliar}</span>
            <span class="pill">⚠️ Alergia: Penicilina</span>
          </div>
        </div>
        <button class="btn btn-ghost" data-go="citas:agendar">📅 Agendar una cita</button>
      </div>

      <div class="grid g-4" style="margin-top:18px">
        <div class="card stat"><div class="ico c-teal">📅</div><div><div class="val">${prox.length}</div><div class="lbl">Citas próximas</div></div></div>
        <div class="card stat"><div class="ico c-mint">💓</div><div><div class="val">${sv.pas}/${sv.pad}</div><div class="lbl">Presión arterial</div><div class="trend" style="color:#059669">▼ Óptima</div></div></div>
        <div class="card stat"><div class="ico c-violet">⚖️</div><div><div class="val">${imc}</div><div class="lbl">IMC · ${sv.peso} kg</div><div class="trend" style="color:#059669">▼ 4,8 kg en el año</div></div></div>
        <div class="card stat"><div class="ico c-amber">💬</div><div><div class="val">${abiertas}</div><div class="lbl">PQRS abiertas</div></div></div>
      </div>

      <div class="card" style="margin-top:18px">
        <div class="card-head"><h3>Accesos rápidos</h3></div>
        <div class="quick">
          ${[["citas:agendar", "📅", "c-teal", "Agendar cita"], ["historia", "📋", "c-violet", "Historia clínica"], ["resultados", "🧪", "c-mint", "Resultados"], ["medicamentos", "💊", "c-coral", "Medicamentos"], ["autorizaciones:solicitar", "✅", "c-amber", "Autorizaciones"], ["certificados", "📄", "c-teal", "Certificados"], ["pqrs:radicar", "💬", "c-violet", "Radicar PQRS"], ["red", "🏥", "c-mint", "Red de atención"]]
            .map(([g, i, c, l]) => `<button data-go="${g}"><span class="ico ${c}">${i}</span>${l}</button>`).join("")}
        </div>
      </div>

      <div class="grid g-3" style="margin-top:18px">
        <div class="card span-2">
          <div class="card-head"><h3>Próximas citas</h3><button class="btn btn-soft btn-sm" data-go="citas">Ver todas</button></div>
          ${prox.length ? `<div class="list">${prox.slice(0, 3).map(citaItem).join("")}</div>` : `<div class="empty">No tienes citas programadas.</div>`}
        </div>
        <div class="card">
          <div class="card-head"><h3>Próximas entregas</h3><span class="sub">Medicamentos</span></div>
          <div class="list">${medsProx.slice(0, 3).map((m) => `
            <div class="item"><div class="ico c-coral" style="width:40px;height:40px;border-radius:12px;display:grid;place-items:center">💊</div>
            <div class="body"><b>${m.nombre}</b><small>${fecha(m.proximaEntrega)} · ${m.entregasRestantes} entregas restantes</small></div></div>`).join("")}
          </div>
        </div>
      </div>

      <div class="grid g-2" style="margin-top:18px">
        <div class="card">
          <div class="card-head"><h3>Evolución del peso</h3><span class="sub">kg · últimos 12 meses</span></div>
          ${lineChart([{ name: "Peso", color: "#7c3aed", data: p.signosVitales.map((s) => s.peso) }], p.signosVitales.map((s) => s.fecha), { min: 74, max: 84, unit: "" })}
        </div>
        <div class="card">
          <div class="card-head"><h3>Últimos resultados</h3><button class="btn btn-soft btn-sm" data-go="resultados">Ver todos</button></div>
          <div class="list">${p.laboratorios.map((l) => `
            <div class="item"><div class="body"><b>${l.examen}</b><small>${fecha(l.fecha)} · ${l.ordenadoPor}</small></div>${pill(l.estado)}</div>`).join("")}
          </div>
        </div>
      </div>`;
  },

  afiliacion() {
    const a = S.p.afiliado;
    const qr = Array.from({ length: 49 }, (_, i) => ((i * 7 + a.cedula.charCodeAt(i % 10)) % 3 ? "#0a2540" : "#fff"));
    return head("Mi afiliación", "Datos de afiliación, carnet digital y grupo familiar.", `<button class="btn btn-ghost" onclick="window.print()">🖨️ Imprimir carnet</button>`) + `
      <div class="grid g-2">
        <div>
          <div class="carnet">
            <div class="top">
              <div class="brand" style="font-size:16px"><div class="brand-mark" style="width:34px;height:34px">✚</div>MediGestión EPS</div>
              <svg class="qr" viewBox="0 0 7 7">${qr.map((c, i) => `<rect x="${i % 7}" y="${Math.floor(i / 7)}" width="1" height="1" fill="${c}"/>`).join("")}</svg>
            </div>
            <div>
              <div class="name">${a.nombres} ${a.apellidos}</div>
              <div class="num">${a.tipoDocumento} ${a.cedula}</div>
            </div>
            <div class="row">
              <div><span>Régimen</span>${a.regimen}</div>
              <div><span>Categoría</span>${a.categoria}</div>
              <div><span>RH</span>${a.grupoSanguineo}</div>
              <div><span>Carnet</span>${a.numeroCarnet}</div>
            </div>
          </div>
          <div class="alert alert-ok" style="margin-top:16px">✔ Afiliación <b>ACTIVA</b> desde ${fecha(a.fechaAfiliacion)} · ${a.semanasCotizadas} semanas cotizadas.</div>
        </div>
        <div class="card">
          <div class="card-head"><h3>Datos personales</h3><button class="btn btn-soft btn-sm" data-act="editarDatos">✏️ Actualizar</button></div>
          <div class="kv">
            <div><span>Documento</span><b>${a.tipoDocumento} ${a.cedula}</b></div>
            <div><span>Fecha de nacimiento</span><b>${fecha(a.fechaNacimiento)} (${edad(a.fechaNacimiento)} años)</b></div>
            <div><span>Sexo</span><b>${a.sexo}</b></div>
            <div><span>Estado civil</span><b>${a.estadoCivil}</b></div>
            <div><span>Teléfono</span><b>${a.telefono}</b></div>
            <div><span>Correo</span><b>${a.correo}</b></div>
            <div><span>Dirección</span><b>${a.direccion}, ${a.ciudad}</b></div>
            <div><span>Ocupación</span><b>${a.ocupacion}</b></div>
            <div><span>Empleador</span><b>${a.empleador}</b></div>
            <div><span>Tipo de afiliado</span><b>${a.tipoAfiliado}</b></div>
            <div><span>IPS primaria</span><b>${a.ipsPrimaria}</b></div>
            <div><span>Contacto de emergencia</span><b>${a.contactoEmergencia.nombre} · ${a.contactoEmergencia.telefono}</b></div>
          </div>
        </div>
      </div>
      <div class="card" style="margin-top:18px">
        <div class="card-head"><h3>Grupo familiar (beneficiarios)</h3><span class="sub">${S.p.beneficiarios.length} beneficiarios</span></div>
        <div class="table-wrap"><table><thead><tr><th>Nombre</th><th>Documento</th><th>Parentesco</th><th>Edad</th><th>Estado</th></tr></thead><tbody>
        ${S.p.beneficiarios.map((b) => `<tr><td><b>${b.nombre}</b></td><td>${b.documento}</td><td>${b.parentesco}</td><td>${b.edad} años</td><td>${pill(b.estado)}</td></tr>`).join("")}
        </tbody></table></div>
      </div>`;
  },

  historia() {
    const p = S.p, r = p.resumenClinico;
    const t = tabs("historia", [["resumen", "Resumen clínico"], ["consultas", "Consultas y evoluciones"], ["signos", "Signos vitales"], ["antecedentes", "Antecedentes"], ["vacunas", "Vacunación"]]);
    let body = "";
    if (t.cur === "resumen") body = `
      <div class="grid g-2">
        <div class="card">
          <div class="card-head"><h3>⚠️ Alergias</h3><span class="sub">${r.alergias.length} registradas</span></div>
          ${r.alergias.map((al) => `<div class="allergy"><div class="ico">🚫</div><div style="flex:1"><b>${al.sustancia}</b> ${pill(al.severidad)}<br><small>${al.reaccion} · registrada ${fecha(al.registrada)}</small></div></div>`).join("")}
        </div>
        <div class="card">
          <div class="card-head"><h3>Riesgo cardiovascular</h3></div>
          <div class="stat"><div class="ico c-mint">❤️</div><div><div class="val" style="font-size:20px">${r.riesgoCardiovascular.puntaje}</div><div class="lbl">Calculado el ${fecha(r.riesgoCardiovascular.calculado)}</div></div></div>
          <div class="kv" style="margin-top:18px">
            <div><span>Grupo sanguíneo</span><b>${p.afiliado.grupoSanguineo}</b></div>
            <div><span>Médico de familia</span><b>${p.afiliado.medicoFamiliar}</b></div>
            <div><span>Última consulta</span><b>${fecha(p.consultas[0].fecha)}</b></div>
            <div><span>Control de asma (ACT)</span><b>23/25 · Controlada</b></div>
          </div>
        </div>
        <div class="card span-2">
          <div class="card-head"><h3>Diagnósticos (CIE-10)</h3></div>
          <div class="table-wrap"><table><thead><tr><th>Código</th><th>Diagnóstico</th><th>Desde</th><th>Estado</th></tr></thead><tbody>
          ${r.diagnosticos.map((d) => `<tr><td><span class="pill p-violet">${d.cie10}</span></td><td><b>${d.descripcion}</b></td><td>${fecha(d.desde)}</td><td>${pill(d.estado)}</td></tr>`).join("")}
          </tbody></table></div>
        </div>
      </div>`;
    if (t.cur === "consultas") body = `<div class="timeline">${p.consultas.map((c, i) => `
      <div class="tl-item"><details class="tl-card" ${i === 0 ? "open" : ""}>
        <summary><span class="when">${fecha(c.fecha)}</span>
          <span class="what"><b>${c.especialidad} · ${c.tipo}</b><small>${c.profesional} — ${c.sede}</small></span>
          ${c.diagnosticos.map((d) => `<span class="pill p-violet">${d.split(" ")[0]}</span>`).join("")}<span class="chev">▶</span>
        </summary>
        <div class="soap">
          <div class="full"><h5>Motivo de consulta</h5>${c.motivo}</div>
          <div><h5>S · Subjetivo</h5>${c.subjetivo}</div>
          <div><h5>O · Objetivo</h5>${c.objetivo}</div>
          <div><h5>A · Análisis</h5>${c.analisis}</div>
          <div><h5>P · Plan</h5>${c.plan}</div>
          <div class="full"><h5>Diagnósticos</h5>${c.diagnosticos.join(" · ")}</div>
        </div>
      </details></div>`).join("")}</div>`;
    if (t.cur === "signos") {
      const sv = p.signosVitales, f = sv.map((s) => s.fecha);
      body = `<div class="grid g-2">
        <div class="card"><div class="card-head"><h3>Presión arterial</h3><span class="sub">mmHg</span></div>
          ${lineChart([{ name: "Sistólica", color: "#f43f5e", data: sv.map((s) => s.pas) }, { name: "Diastólica", color: "#0891b2", data: sv.map((s) => s.pad) }], f, { min: 60, max: 140 })}</div>
        <div class="card"><div class="card-head"><h3>Frecuencia cardiaca</h3><span class="sub">lpm</span></div>
          ${lineChart([{ name: "FC", color: "#10b981", data: sv.map((s) => s.fc) }], f, { min: 55, max: 85 })}</div>
        <div class="card span-2"><div class="card-head"><h3>Registro de signos vitales</h3></div>
          <div class="table-wrap"><table><thead><tr><th>Fecha</th><th>Peso</th><th>Talla</th><th>IMC</th><th>PA</th><th>FC</th><th>SpO₂</th><th>Temp.</th></tr></thead><tbody>
          ${[...sv].reverse().map((s) => `<tr><td><b>${fecha(s.fecha)}</b></td><td>${s.peso} kg</td><td>${s.talla} m</td><td>${(s.peso / s.talla ** 2).toFixed(1)}</td><td>${s.pas}/${s.pad}</td><td>${s.fc} lpm</td><td>${s.spo2} %</td><td>${s.temp} °C</td></tr>`).join("")}
          </tbody></table></div></div>
      </div>`;
    }
    if (t.cur === "antecedentes") {
      const an = p.resumenClinico.antecedentes;
      body = `<div class="grid g-2">${[["🧍 Personales", an.personales], ["🔪 Quirúrgicos", an.quirurgicos], ["👨‍👩‍👦 Familiares", an.familiares], ["🚴 Hábitos y estilo de vida", an.habitos]]
        .map(([t2, l]) => `<div class="card"><div class="card-head"><h3>${t2}</h3></div><ul class="chip-list">${l.map((x) => `<li>${x}</li>`).join("")}</ul></div>`).join("")}</div>`;
    }
    if (t.cur === "vacunas") body = `<div class="card"><div class="card-head"><h3>💉 Carné de vacunación</h3><span class="sub">${p.vacunas.filter((v) => v.estado === "Pendiente").length} pendientes</span></div>
      <div class="table-wrap"><table><thead><tr><th>Vacuna</th><th>Dosis</th><th>Fecha</th><th>Lote</th><th>Estado</th></tr></thead><tbody>
      ${p.vacunas.map((v) => `<tr><td><b>${v.vacuna}</b></td><td>${v.dosis}</td><td>${fecha(v.fecha)}</td><td>${v.lote}</td><td>${pill(v.estado)}</td></tr>`).join("")}
      </tbody></table></div></div>`;
    return head("Historia clínica", "Tu información clínica consolidada de toda la red MediGestión.", `<button class="btn btn-ghost no-print" onclick="window.print()">🖨️ Descargar / imprimir</button>`) + t.html + body;
  },

  resultados() {
    const p = S.p;
    const t = tabs("resultados", [["lab", "Laboratorio clínico"], ["img", "Imágenes y ayudas diagnósticas"]]);
    const pos = (r) => {
      const m = String(r.referencia).replace(/,/g, ".").match(/[\d.]+/g)?.map(Number) || [];
      let lo, hi;
      if (r.referencia.includes("<")) { lo = 0; hi = m[0]; } else if (r.referencia.includes(">")) { lo = m[0]; hi = m[0] * 2; } else { [lo, hi] = m; }
      return Math.max(4, Math.min(96, 20 + ((r.valor - lo) / (hi - lo)) * 60));
    };
    const body = t.cur === "lab"
      ? p.laboratorios.map((l) => `<div class="card" style="margin-bottom:16px">
          <div class="card-head"><div><h3>${l.examen}</h3><span class="sub">${fecha(l.fecha)} · ${l.laboratorio} · Ordenado por ${l.ordenadoPor}</span></div>${pill(l.estado)}</div>
          ${l.resultados.length ? `<div class="table-wrap"><table><thead><tr><th>Parámetro</th><th>Resultado</th><th>Referencia</th><th style="width:180px">Rango</th><th></th></tr></thead><tbody>
          ${l.resultados.map((r) => `<tr><td><b>${r.parametro}</b></td><td><b>${String(r.valor).replace(".", ",")}</b> ${r.unidad}</td><td>${r.referencia} ${r.unidad}</td><td><div class="range"><i style="left:${pos(r)}%"></i></div></td><td>${r.estado === "normal" ? '<span class="pill p-ok">Normal</span>' : '<span class="pill p-bad">▲ Alto</span>'}</td></tr>`).join("")}
          </tbody></table></div>` : `<div class="alert alert-info">⏳ Muestra en procesamiento. Te notificaremos cuando el resultado esté disponible (aprox. 48 horas).</div>`}
        </div>`).join("")
      : `<div class="grid g-3">${p.imagenes.map((i) => `<div class="card"><div class="stat"><div class="ico c-violet">🩻</div><div><b>${i.estudio}</b><div class="lbl">${fecha(i.fecha)} · ${i.sede}</div></div></div>
          <p style="margin:14px 0 0;padding:12px;background:#f8fafc;border-radius:12px"><b>Conclusión:</b> ${i.conclusion}</p></div>`).join("")}</div>`;
    return head("Resultados", "Consulta e imprime tus resultados de laboratorio e imágenes diagnósticas.") + t.html + body;
  },

  medicamentos() {
    const p = S.p;
    const t = tabs("medicamentos", [["activos", "Fórmulas activas"], ["entregas", "Historial de entregas"]]);
    const body = t.cur === "activos"
      ? `<div class="grid g-2">${p.medicamentos.map((m) => `<div class="card">
          <div class="card-head"><div class="stat"><div class="ico ${m.estado === "Activo" ? "c-coral" : "c-teal"}">💊</div><div><b>${m.nombre}</b><div class="lbl">${m.presentacion} · Vía ${m.via} · ${m.tipo}</div></div></div>${pill(m.estado)}</div>
          <div class="kv"><div><span>Posología</span><b>${m.dosis}</b></div><div><span>Prescriptor</span><b>${m.prescriptor}</b></div>
          <div><span>Inicio</span><b>${fecha(m.inicio)}</b></div><div><span>Próxima entrega</span><b>${fecha(m.proximaEntrega)}</b></div></div>
          ${m.estado === "Activo" ? `<div style="display:flex;gap:8px;margin-top:16px;flex-wrap:wrap"><button class="btn btn-soft btn-sm" data-act="domicilio" data-med="${esc(m.nombre)}">🛵 Solicitar a domicilio</button><span class="pill p-info">${m.entregasRestantes} entregas restantes</span></div>` : ""}
        </div>`).join("")}</div>`
      : `<div class="card"><div class="table-wrap"><table><thead><tr><th>Fecha</th><th>Medicamento</th><th>Punto de entrega</th><th>Estado</th></tr></thead><tbody>
        ${p.entregasMedicamentos.map((e) => `<tr><td><b>${fecha(e.fecha)}</b></td><td>${e.medicamento}</td><td>${e.farmacia}</td><td>${pill(e.estado)}</td></tr>`).join("")}
        </tbody></table></div></div>`;
    return head("Medicamentos", "Tus fórmulas vigentes, entregas programadas y domicilios.") + t.html + body;
  },

  programas() {
    return head("Programas de salud", "Promoción y prevención: programas en los que estás inscrito.") + `
      <div class="grid g-3">${S.p.programas.map((pr, i) => `<div class="card">
        <div class="stat"><div class="ico ${["c-coral", "c-teal", "c-mint"][i % 3]}">${["❤️", "🫁", "👶"][i % 3]}</div><div><b>${pr.nombre}</b></div></div>
        <p style="color:var(--ink-2)">${pr.descripcion}</p>
        <div class="row-between" style="font-size:13px;font-weight:800;margin-bottom:6px"><span>Avance</span><span>${pr.progreso} %</span></div>
        <div class="progress"><i style="width:${pr.progreso}%"></i></div>
        <div class="alert alert-info" style="margin:14px 0 0">📌 ${pr.proximaActividad}</div>
      </div>`).join("")}</div>
      <div class="card" style="margin-top:18px"><div class="card-head"><h3>Recomendaciones para ti</h3></div>
        <ul class="chip-list">
          <li>🥗 Mantén una dieta baja en grasas saturadas: tu LDL bajó de 172 a 118 mg/dL. ¡Vas muy bien!</li>
          <li>💉 Tienes pendiente la vacuna contra neumococo (PCV20), recomendada por tu diagnóstico de asma.</li>
          <li>🦷 Recuerda tu control odontológico semestral: tuviste una inasistencia en julio.</li>
          <li>😴 Procura dormir entre 7 y 8 horas diarias.</li>
        </ul></div>`;
  },

  citas() {
    const t = tabs("citas", [["proximas", "Próximas citas"], ["agendar", "Agendar cita"], ["historial", "Historial"]]);
    let body = "";
    if (t.cur === "proximas") {
      const prox = proximas();
      body = `<div class="card">${prox.length ? `<div class="list">${prox.map((c) => citaItem(c, true)).join("")}</div>` : `<div class="empty">No tienes citas programadas. <br><br><button class="btn btn-primary" data-go="citas:agendar">Agendar una cita</button></div>`}</div>
        <div class="alert alert-info" style="margin-top:16px">ℹ️ Recuerda llegar 20 minutos antes con tu documento. Las cancelaciones deben realizarse con mínimo 24 horas de anticipación.</div>`;
    }
    if (t.cur === "agendar") {
      const cat = S.p.catalogo, esp = Object.keys(cat.especialidades);
      const manana = new Date(Date.now() + 864e5).toLocaleDateString("en-CA");
      body = `<div class="grid g-3"><div class="card span-2"><form id="formCita">
        <div class="form-grid">
          <div class="field"><label>Especialidad</label><select id="cEsp">${esp.map((e) => `<option>${e}</option>`).join("")}</select></div>
          <div class="field"><label>Profesional</label><select id="cMed"></select></div>
          <div class="field"><label>Sede</label><select id="cSede">${cat.sedes.map((s) => `<option>${s}</option>`).join("")}</select></div>
          <div class="field"><label>Fecha</label><input type="date" id="cFecha" min="${manana}" value="${manana}"></div>
        </div>
        <label style="font-weight:700;font-size:13px;color:var(--ink-2)">Horario disponible</label>
        <div class="slots" id="cSlots" style="margin-top:6px">${cat.horas.map((h) => `<button type="button" data-h="${h}">${h}</button>`).join("")}</div>
        <div class="field"><label>Motivo de consulta</label><textarea id="cMotivo" placeholder="Describe brevemente el motivo de tu consulta" maxlength="500"></textarea></div>
        <button class="btn btn-primary" type="submit" id="cBtn">📅 Confirmar cita</button>
      </form></div>
      <div class="card"><div class="card-head"><h3>Antes de agendar</h3></div><ul class="chip-list">
        <li>🩺 Medicina general, odontología, psicología y nutrición no requieren remisión.</li>
        <li>📝 Las especialidades requieren orden médica vigente.</li>
        <li>💻 Elige la sede <b>Telemedicina</b> para una consulta virtual.</li>
        <li>💵 Cuota moderadora categoría B: <b>$ 18.600</b></li>
      </ul></div></div>`;
    }
    if (t.cur === "historial") {
      const pasadas = [...S.citas.filter((c) => c.fecha < hoyISO() || c.estado === "Cancelada").map((c) => ({ ...c, estado: c.estado === "Cancelada" ? c.estado : "Atendida" })), ...S.p.historialCitas]
        .sort((a, b) => b.fecha.localeCompare(a.fecha));
      body = `<div class="card"><div class="table-wrap"><table><thead><tr><th>Fecha</th><th>Especialidad</th><th>Profesional</th><th>Sede</th><th>Estado</th></tr></thead><tbody>
        ${pasadas.map((c) => `<tr><td><b>${fecha(c.fecha)}</b> ${c.hora}</td><td>${esc(c.especialidad)}</td><td>${esc(c.medico)}</td><td>${esc(c.sede)}</td><td>${pill(c.estado)}</td></tr>`).join("")}
        </tbody></table></div></div>`;
    }
    return head("Citas médicas", "Agenda, confirma, reprograma o cancela tus citas.") + t.html + body;
  },

  autorizaciones() {
    const t = tabs("autorizaciones", [["vigentes", "Mis autorizaciones"], ["solicitar", "Solicitar autorización"]]);
    const body = t.cur === "vigentes" ? `
      ${S.solicitudes.length ? `<div class="card" style="margin-bottom:16px"><div class="card-head"><h3>Solicitudes en estudio</h3></div><div class="table-wrap"><table><thead><tr><th>Número</th><th>Servicio</th><th>Ordenado por</th><th>Fecha</th><th>Estado</th></tr></thead><tbody>
        ${S.solicitudes.map((s) => `<tr><td><b>${esc(s.numero)}</b></td><td>${esc(s.servicio)}</td><td>${esc(s.ordenadoPor)}</td><td>${fecha(s.createdAt)}</td><td>${pill(s.estado)}</td></tr>`).join("")}
      </tbody></table></div></div>` : ""}
      <div class="card"><div class="card-head"><h3>Autorizaciones emitidas</h3></div><div class="table-wrap"><table><thead><tr><th>Número</th><th>Servicio</th><th>Prestador</th><th>Emitida</th><th>Vigencia</th><th>Estado</th></tr></thead><tbody>
        ${S.p.autorizaciones.map((a) => `<tr><td><b>${a.numero}</b></td><td>${a.servicio}</td><td>${a.prestador}</td><td>${fecha(a.fecha)}</td><td>${fecha(a.vigencia)}</td><td>${pill(a.estado)}</td></tr>`).join("")}
      </tbody></table></div></div>` : `
      <div class="grid g-3"><div class="card span-2"><form id="formAut">
        <div class="field"><label>Servicio o procedimiento ordenado</label><input id="aServ" placeholder="Ej. Resonancia magnética de rodilla" maxlength="200"></div>
        <div class="field"><label>Profesional que lo ordenó</label><input id="aMed" placeholder="Ej. Dr. Ricardo Alonso Beltrán" maxlength="120"></div>
        <div class="field"><label>Observaciones</label><textarea id="aObs" maxlength="1000" placeholder="Información adicional (opcional)"></textarea></div>
        <button class="btn btn-primary" type="submit">Enviar solicitud</button>
      </form></div>
      <div class="card"><div class="card-head"><h3>Tiempos de respuesta</h3></div><ul class="chip-list">
        <li>⚡ Servicios prioritarios: hasta 2 días hábiles.</li><li>📋 Servicios electivos: hasta 5 días hábiles.</li><li>📎 Ten a mano tu orden médica firmada.</li></ul></div></div>`;
    return head("Autorizaciones", "Consulta y solicita autorizaciones de servicios de salud.") + t.html + body;
  },

  certificados() {
    const a = S.p.afiliado;
    const t = tabs("certificados", [["afiliacion", "Certificado de afiliación"], ["incapacidades", "Incapacidades"]]);
    const body = t.cur === "afiliacion" ? `
      <div class="cert">
        <header><div class="brand" style="color:var(--navy)"><div class="brand-mark">✚</div>MediGestión EPS<small style="color:var(--ink-3)">NIT 900.555.012-3</small></div><button class="btn btn-primary no-print" onclick="window.print()">🖨️ Imprimir</button></header>
        <h3 style="text-align:center;margin-bottom:16px">CERTIFICADO DE AFILIACIÓN</h3>
        <p>MediGestión EPS certifica que <b>${a.nombres} ${a.apellidos}</b>, identificado(a) con ${a.tipoDocumento} <b>${a.cedula}</b>, se encuentra afiliado(a) en calidad de <b>${a.tipoAfiliado}</b> al régimen <b>${a.regimen}</b>, categoría <b>${a.categoria}</b>, con estado <b>${a.estadoAfiliacion.toUpperCase()}</b> desde el ${fecha(a.fechaAfiliacion)}.</p>
        <p>Grupo familiar: ${S.p.beneficiarios.map((b) => `${b.nombre} (${b.parentesco})`).join(", ")}.</p>
        <p>Se expide a solicitud del interesado el ${fecha(hoyISO())}. Código de verificación: <b>MG-${a.cedula.slice(-4)}-${Date.now().toString(36).toUpperCase().slice(-6)}</b></p>
        <p style="color:var(--ink-3);font-size:13px;margin-top:24px">Documento de demostración con datos ficticios.</p>
      </div>` : `
      <div class="card"><div class="table-wrap"><table><thead><tr><th>Número</th><th>Desde</th><th>Hasta</th><th>Días</th><th>Origen</th><th>Diagnóstico</th><th>Estado</th></tr></thead><tbody>
      ${S.p.incapacidades.map((i) => `<tr><td><b>${i.numero}</b></td><td>${fecha(i.desde)}</td><td>${fecha(i.hasta)}</td><td>${i.dias}</td><td>${i.origen}</td><td>${i.diagnostico}</td><td>${pill(i.estado)}</td></tr>`).join("")}
      </tbody></table></div></div>`;
    return head("Certificados e incapacidades", "Descarga certificados y consulta tus incapacidades.") + t.html + body;
  },

  pqrs() {
    const t = tabs("pqrs", [["radicar", "Radicar PQRS"], ["mis", `Mis solicitudes (${S.pqrs.length})`]]);
    const tipo = S.pqrsTipo || "Petición";
    const body = t.cur === "radicar" ? `
      <div class="grid g-3"><div class="card span-2"><form id="formPqrs">
        <label style="font-weight:700;font-size:13px;color:var(--ink-2)">Tipo de solicitud</label>
        <div class="type-picker" style="margin-top:6px">${[["Petición", "🙋"], ["Queja", "😟"], ["Reclamo", "⚠️"], ["Sugerencia", "💡"], ["Felicitación", "🌟"]]
          .map(([n, i]) => `<button type="button" data-tipo="${n}" class="${tipo === n ? "sel" : ""}"><i>${i}</i>${n}</button>`).join("")}</div>
        <div class="form-grid">
          <div class="field"><label>Categoría</label><select id="qCat">${["Citas médicas", "Entrega de medicamentos", "Autorizaciones", "Atención en IPS", "Urgencias", "Afiliación", "Trato del personal", "Otro"].map((c) => `<option>${c}</option>`).join("")}</select></div>
          <div class="field"><label>Canal de respuesta</label><select id="qCanal"><option>Correo electrónico</option><option>Mensaje de texto</option><option>Llamada telefónica</option><option>Portal web</option></select></div>
          <div class="field full"><label>Asunto</label><input id="qAsunto" maxlength="150" placeholder="Resumen de tu solicitud"></div>
          <div class="field full"><label>Descripción detallada</label><textarea id="qDesc" maxlength="3000" placeholder="Cuéntanos qué pasó, cuándo y dónde (mínimo 20 caracteres)"></textarea></div>
        </div>
        <button class="btn btn-primary" type="submit">Radicar ${tipo.toLowerCase()}</button>
      </form></div>
      <div class="card"><div class="card-head"><h3>¿Qué es cada una?</h3></div><ul class="chip-list">
        <li><b>Petición:</b> solicitud de información o de un servicio.</li><li><b>Queja:</b> inconformidad con la atención recibida.</li>
        <li><b>Reclamo:</b> exigencia por un servicio no prestado o deficiente.</li><li><b>Sugerencia:</b> propuesta para mejorar.</li>
        <li><b>Felicitación:</b> reconocimiento a un buen servicio.</li><li>⏱️ Respuesta en máximo <b>15 días hábiles</b>.</li></ul></div></div>` : `
      <div class="list">${S.pqrs.map((q) => `<div class="card">
        <div class="card-head"><div><h3>${esc(q.asunto)}</h3><span class="sub">${esc(q.radicado)} · ${esc(q.tipo)} · ${esc(q.categoria)} · ${fecha(q.createdAt)}</span></div>${pill(q.estado)}</div>
        <p style="margin:0;color:var(--ink-2)">${esc(q.descripcion)}</p>
        ${q.respuesta ? `<div class="alert alert-ok" style="margin:14px 0 0">✉️ <b>Respuesta:</b> ${esc(q.respuesta)}</div>` : `<div class="alert alert-info" style="margin:14px 0 0">⏳ En revisión. Recibirás respuesta por ${esc(q.canalRespuesta.toLowerCase())}.</div>`}
      </div>`).join("") || `<div class="card empty">No has radicado solicitudes.</div>`}</div>`;
    return head("PQRS", "Peticiones, quejas, reclamos, sugerencias y felicitaciones.") + t.html + body;
  },

  red() {
    const sedes = [
      ["IPS MediGestión Salitre", "Av. Calle 26 # 69-76, Bogotá", "Lun-Sáb 6:00 a.m. - 8:00 p.m.", "Medicina general, interna, odontología, laboratorio, droguería", "🏥"],
      ["Clínica MediGestión Norte", "Cra. 15 # 127-40, Bogotá", "24 horas", "Urgencias, hospitalización, especialistas, imágenes", "🚑"],
      ["IPS MediGestión Kennedy", "Av. 1 de Mayo # 72-15, Bogotá", "Lun-Sáb 6:00 a.m. - 7:00 p.m.", "Medicina general, odontología, vacunación, P&P", "🏥"],
      ["IPS MediGestión Suba", "Calle 145 # 91-19, Bogotá", "Lun-Vie 7:00 a.m. - 6:00 p.m.", "Medicina general, pediatría, psicología", "🏥"],
      ["Centro de Imágenes MediGestión", "Calle 100 # 19-61, Bogotá", "Lun-Sáb 6:00 a.m. - 9:00 p.m.", "Rayos X, ecografía, TAC, resonancia", "🩻"],
      ["Droguería MediGestión 24h", "Av. Boyacá # 64-20, Bogotá", "24 horas", "Entrega de medicamentos y domicilios", "💊"],
    ];
    return head("Red de atención", "Sedes, horarios y servicios disponibles para ti.") + `<div class="grid g-3">${sedes.map(([n, d, h, s, i]) => `
      <div class="card"><div class="stat"><div class="ico c-teal">${i}</div><div><b>${n}</b><div class="lbl">📍 ${d}</div></div></div>
      <div class="kv" style="margin-top:14px;grid-template-columns:1fr"><div><span>Horario</span><b>${h}</b></div><div><span>Servicios</span><b>${s}</b></div></div></div>`).join("")}</div>`;
  },

  ayuda() {
    const faq = [
      ["¿Cómo cancelo una cita?", "Ve a Citas médicas › Próximas citas y presiona «Cancelar». Hazlo con 24 horas de anticipación para evitar multas por inasistencia."],
      ["¿Cuánto cuesta la cuota moderadora?", "Para la categoría B el valor 2026 es de $ 18.600 por consulta. Los programas de promoción y prevención no tienen cobro."],
      ["¿Cómo incluyo un beneficiario?", "Acércate a tu IPS primaria con el documento del beneficiario y el soporte de parentesco, o escríbenos por PQRS (Petición › Afiliación)."],
      ["¿Qué hago en una urgencia?", "Llama al 123 o acude a la Clínica MediGestión Norte, abierta las 24 horas. No necesitas autorización para urgencias."],
      ["¿Cómo recibo mis medicamentos a domicilio?", "En Medicamentos › Fórmulas activas presiona «Solicitar a domicilio». La entrega tarda de 24 a 48 horas."],
    ];
    return head("Centro de ayuda", "Resolvemos tus dudas frecuentes.") + `<div class="grid g-3"><div class="span-2 list">${faq.map(([q, r]) => `
      <details class="tl-card"><summary><span class="what"><b>${q}</b></span><span class="chev">▶</span></summary><div style="padding:0 18px 18px;color:var(--ink-2)">${r}</div></details>`).join("")}</div>
      <div class="card"><div class="card-head"><h3>Canales de atención</h3></div><ul class="chip-list">
        <li>🚑 Urgencias: <b>123</b></li><li>📞 Línea MediGestión: <b>601 555 0123</b></li><li>💬 WhatsApp: <b>310 555 0199</b></li><li>✉️ atencion@medigestion-eps.co</li></ul></div></div>`;
  },
};

function citaItem(c, acciones = false) {
  const [, m, d] = c.fecha.split("-");
  return `<div class="item">
    <div class="date-box"><b>${+d}</b><span>${MESES[m - 1]}</span></div>
    <div class="body"><b>${esc(c.especialidad)} · ${c.hora}</b><small>${esc(c.medico)} — ${esc(c.sede)} ${c.modalidad === "Virtual" ? "💻" : ""}</small>${c.motivo ? `<small>📝 ${esc(c.motivo)}</small>` : ""}</div>
    ${pill(c.estado)}
    ${acciones ? `<div class="actions">
      ${c.estado === "Programada" ? `<button class="btn btn-soft btn-sm" data-cita="confirmar" data-id="${c.id}">✔ Confirmar</button>` : ""}
      <button class="btn btn-ghost btn-sm" data-cita="reprogramar" data-id="${c.id}">↻ Reprogramar</button>
      <button class="btn btn-danger btn-sm" data-cita="cancelar" data-id="${c.id}">✕ Cancelar</button></div>` : ""}
  </div>`;
}

// ================= EVENTOS =================
function bindView() {
  const v = $("#view");
  v.querySelectorAll("[data-go]").forEach((b) => (b.onclick = () => { const [view, tab] = b.dataset.go.split(":"); go(view, tab); }));
  v.querySelectorAll("[data-tab]").forEach((b) => (b.onclick = () => { const [view, tab] = b.dataset.tab.split(":"); S.tab[view] = tab; render(); }));
  v.querySelectorAll("[data-cita]").forEach((b) => (b.onclick = () => accionCita(b.dataset.cita, Number(b.dataset.id))));
  v.querySelectorAll("[data-act=domicilio]").forEach((b) => (b.onclick = () => toast(`Domicilio de ${b.dataset.med} programado para las próximas 48 horas.`)));
  v.querySelectorAll("[data-act=editarDatos]").forEach((b) => (b.onclick = () => modal(`<h3>Actualizar datos</h3><p style="color:var(--ink-2)">Por seguridad, la actualización de datos de contacto se valida con un asesor. Radica una <b>Petición</b> en la sección PQRS con la categoría «Afiliación».</p><div class="actions"><button class="btn btn-ghost" onclick="closeModal()">Cerrar</button><button class="btn btn-primary" id="irPqrs">Ir a PQRS</button></div>`) || ($("#irPqrs").onclick = () => { closeModal(); go("pqrs", "radicar"); })));

  // Agendar cita
  const f = $("#formCita");
  if (f) {
    let hora = null;
    const cat = S.p.catalogo;
    const fillMed = () => { $("#cMed").innerHTML = cat.especialidades[$("#cEsp").value].map((m) => `<option>${m}</option>`).join(""); refreshSlots(); };
    const refreshSlots = () => {
      const ocupadas = S.citas.filter((c) => c.medico === $("#cMed").value && c.fecha === $("#cFecha").value && c.estado !== "Cancelada").map((c) => c.hora);
      const dow = new Date($("#cFecha").value + "T12:00").getDay();
      f.querySelectorAll("[data-h]").forEach((b) => {
        b.disabled = dow === 0 || ocupadas.includes(b.dataset.h);
        b.classList.toggle("sel", b.dataset.h === hora && !b.disabled);
      });
      if (dow === 0) hora = null;
    };
    $("#cEsp").onchange = fillMed; $("#cMed").onchange = refreshSlots; $("#cFecha").onchange = refreshSlots;
    f.querySelectorAll("[data-h]").forEach((b) => (b.onclick = () => { hora = b.dataset.h; refreshSlots(); }));
    fillMed();
    f.onsubmit = async (e) => {
      e.preventDefault();
      if (!hora) return toast("Selecciona un horario disponible (no hay atención los domingos).", "err");
      $("#cBtn").disabled = true;
      try {
        const cita = await api("/api/citas", { method: "POST", body: JSON.stringify({ especialidad: $("#cEsp").value, medico: $("#cMed").value, sede: $("#cSede").value, fecha: $("#cFecha").value, hora, motivo: $("#cMotivo").value }) });
        S.citas.push(cita); S.citas.sort((a, b) => (a.fecha + a.hora).localeCompare(b.fecha + b.hora));
        toast(`Cita agendada: ${cita.especialidad}, ${fecha(cita.fecha)} a las ${cita.hora}.`);
        go("citas", "proximas");
      } catch (err) { toast(err.message, "err"); $("#cBtn").disabled = false; }
    };
  }

  // PQRS
  v.querySelectorAll("[data-tipo]").forEach((b) => (b.onclick = () => { S.pqrsTipo = b.dataset.tipo; render(); }));
  const fq = $("#formPqrs");
  if (fq) fq.onsubmit = async (e) => {
    e.preventDefault();
    try {
      const q = await api("/api/pqrs", { method: "POST", body: JSON.stringify({ tipo: S.pqrsTipo || "Petición", categoria: $("#qCat").value, canalRespuesta: $("#qCanal").value, asunto: $("#qAsunto").value, descripcion: $("#qDesc").value }) });
      S.pqrs.unshift(q);
      modal(`<h3>✅ Solicitud radicada</h3><p>Tu número de radicado es <b style="font-size:18px">${esc(q.radicado)}</b>.</p><p style="color:var(--ink-2)">Recibirás respuesta en máximo 15 días hábiles por ${esc(q.canalRespuesta.toLowerCase())}.</p><div class="actions"><button class="btn btn-primary" onclick="closeModal()">Entendido</button></div>`);
      go("pqrs", "mis");
    } catch (err) { toast(err.message, "err"); }
  };

  // Autorizaciones
  const fa = $("#formAut");
  if (fa) fa.onsubmit = async (e) => {
    e.preventDefault();
    try {
      const s = await api("/api/autorizaciones", { method: "POST", body: JSON.stringify({ servicio: $("#aServ").value, ordenadoPor: $("#aMed").value, observaciones: $("#aObs").value }) });
      S.solicitudes.unshift(s);
      toast(`Solicitud ${s.numero} enviada. Te notificaremos la respuesta.`);
      go("autorizaciones", "vigentes");
    } catch (err) { toast(err.message, "err"); }
  };
}

async function accionCita(accion, id) {
  const c = S.citas.find((x) => x.id === id);
  const send = async (body, okMsg) => {
    try {
      const upd = await api(`/api/citas/${id}`, { method: "PATCH", body: JSON.stringify(body) });
      Object.assign(c, upd); closeModal(); toast(okMsg); render();
    } catch (err) { toast(err.message, "err"); }
  };
  if (accion === "confirmar") return send({ accion }, "Asistencia confirmada. ¡Te esperamos!");
  if (accion === "cancelar") {
    modal(`<h3>¿Cancelar esta cita?</h3><p style="color:var(--ink-2)">${esc(c.especialidad)} con ${esc(c.medico)} el ${fecha(c.fecha)} a las ${c.hora}.</p><div class="actions"><button class="btn btn-ghost" onclick="closeModal()">Volver</button><button class="btn btn-danger" id="mOk">Sí, cancelar</button></div>`);
    $("#mOk").onclick = () => send({ accion }, "Cita cancelada.");
  }
  if (accion === "reprogramar") {
    const manana = new Date(Date.now() + 864e5).toLocaleDateString("en-CA");
    modal(`<h3>Reprogramar cita</h3><p style="color:var(--ink-2)">${esc(c.especialidad)} · ${esc(c.medico)}</p>
      <div class="field"><label>Nueva fecha</label><input type="date" id="rF" min="${manana}" value="${c.fecha > manana ? c.fecha : manana}"></div>
      <div class="field"><label>Nueva hora</label><select id="rH">${S.p.catalogo.horas.map((h) => `<option ${h === c.hora ? "selected" : ""}>${h}</option>`).join("")}</select></div>
      <div class="actions"><button class="btn btn-ghost" onclick="closeModal()">Volver</button><button class="btn btn-primary" id="mOk">Guardar</button></div>`);
    $("#mOk").onclick = () => send({ accion, fecha: $("#rF").value, hora: $("#rH").value }, "Cita reprogramada.");
  }
}

function renderNotifs() {
  const prox = proximas()[0];
  const items = [
    prox && ["c-teal", "📅", `Cita de ${esc(prox.especialidad)} el ${fecha(prox.fecha)} a las ${prox.hora}`, "Recordatorio"],
    ["c-amber", "🧪", "Tu examen TSH y T4 libre está en proceso", "Resultados"],
    ["c-coral", "💊", "Entrega de Loratadina 10 mg programada", "Medicamentos"],
    ["c-violet", "💉", "Vacuna de neumococo pendiente", "Programas de salud"],
  ].filter(Boolean);
  $("#notifs").innerHTML = `<h4>Notificaciones</h4>${items.map(([c, i, t, s]) => `<div class="notif"><div class="ico ${c}">${i}</div><div>${t}<small>${s}</small></div></div>`).join("")}`;
}

// ================= INICIO =================
async function init() {
  $("#menuToggle").onclick = () => $("#sidebar").classList.toggle("open");
  $("#logout").onclick = async () => { await fetch("/api/auth/logout", { method: "POST" }); location.replace("/"); };
  $("#bell").onclick = (e) => { e.stopPropagation(); renderNotifs(); $("#notifs").classList.toggle("hidden"); };
  document.addEventListener("click", (e) => { if (!e.target.closest("#notifs")) $("#notifs").classList.add("hidden"); });

  try {
    const [p, citas, pqrs, solicitudes] = await Promise.all([api("/api/paciente"), api("/api/citas"), api("/api/pqrs"), api("/api/autorizaciones")]);
    Object.assign(S, { p, citas, pqrs, solicitudes });
  } catch (err) {
    $("#view").innerHTML = `<div class="alert alert-error">${esc(err.message)}</div>`;
    return;
  }
  const a = S.p.afiliado;
  $("#userName").textContent = `${a.nombres.split(" ")[0]} ${a.apellidos.split(" ")[0]}`;
  $("#userDoc").textContent = `${a.tipoDocumento} ${a.cedula}`;
  $("#avatar").textContent = a.nombres[0] + a.apellidos[0];
  const h = location.hash.slice(1);
  if (VIEWS[h]) S.view = h;
  render();
}
window.closeModal = closeModal;
init();
