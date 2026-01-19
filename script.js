let minutoCount = 0;

const el = {
  titulo: document.getElementById("titulo_bloque"),
  intro: document.getElementById("intro"),
  video: document.getElementById("link_video"),

  pdfTrans: document.getElementById("pdf_trans"),

  profTitulo: document.getElementById("prof_titulo"),
  profLink: document.getElementById("prof_link"),
  profDesc: document.getElementById("prof_desc"),

  linkAct: document.getElementById("link_actividad"),
  txtBoton: document.getElementById("texto_boton"),
  txtFinal: document.getElementById("texto_bloque_final"),
  txtTitFinal: document.getElementById("texto_titulo_final"),
  emojiFinal: document.getElementById("emoji_final"),

  minutosCont: document.getElementById("minutos-container"),

  btnAddMin: document.getElementById("btnAddMin"),
  btnGenerar: document.getElementById("btnGenerar"),
  btnCopiar: document.getElementById("btnCopiar"),

  resultado: document.getElementById("resultado"),
  codigo: document.getElementById("codigo"),
};

function escapeHTML(s) {
  return String(s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function cleanURL(u) {
  const v = String(u ?? "").trim();
  return v || "";
}

/** Convierte cualquier URL común de YouTube a URL embed */
function ytEmbed(url) {
  const u = cleanURL(url);
  if (!u) return "";

  if (u.includes("watch?v=")) {
    const id = u.split("watch?v=")[1].split("&")[0];
    return `https://www.youtube.com/embed/${id}`;
  }
  if (u.includes("youtu.be/")) {
    const id = u.split("youtu.be/")[1].split("?")[0];
    return `https://www.youtube.com/embed/${id}`;
  }
  if (u.includes("/embed/")) {
    const id = u.split("/embed/")[1].split(/[?&]/)[0];
    return `https://www.youtube.com/embed/${id}`;
  }
  return u; // si ya viene embed (o algo equivalente)
}

function embedStartLink(embedUrl, seconds) {
  const e = cleanURL(embedUrl);
  if (!e) return "";
  const s = Math.max(0, Number(seconds) || 0);
  return `${e}?start=${s}`;
}

function formatMin(m) {
  const s = String(m ?? "").trim();
  if (!s) return "";
  if (!s.includes(":")) return String(s).padStart(2, "0") + ":00";

  let [mm, ss] = s.split(":");
  mm = (mm || "0").trim();
  ss = (ss || "0").trim();
  return String(mm).padStart(2, "0") + ":" + String(ss).padStart(2, "0");
}

function toSeconds(m) {
  const s = String(m ?? "").trim();
  if (!s) return 0;

  if (!s.includes(":")) {
    const mm = parseInt(s, 10);
    return Number.isFinite(mm) ? mm * 60 : 0;
  }

  let [mm, ss] = s.split(":");
  mm = parseInt(mm, 10);
  ss = parseInt(ss, 10);

  mm = Number.isFinite(mm) ? mm : 0;
  ss = Number.isFinite(ss) ? ss : 0;
  return mm * 60 + ss;
}

function toast(msg, ok = true) {
  const t = document.createElement("div");
  t.className = "toast";
  t.textContent = msg;
  if (!ok) t.style.background = "rgba(153, 27, 27, 0.92)";
  document.body.appendChild(t);
  requestAnimationFrame(() => t.classList.add("show"));
  setTimeout(() => {
    t.classList.remove("show");
    setTimeout(() => t.remove(), 200);
  }, 1400);
}

function addMinRow() {
  minutoCount += 1;
  const rowId = `row_${minutoCount}`;

  el.minutosCont.insertAdjacentHTML(
    "beforeend",
    `<div class="min-row" id="${rowId}">
      <div class="field">
        <label>Minuto ${minutoCount} (mm:ss o mm)</label>
        <input type="text" id="m_${minutoCount}" placeholder="Ej: 1:30" />
      </div>
      <div class="field">
        <label>Explicación (puede incluir LaTeX)</label>
        <input type="text" id="t_${minutoCount}" placeholder="Ej: \\(f\\ge 0\\) y particiones..." />
      </div>
      <button class="btn btn-ghost" type="button" aria-label="Eliminar" title="Eliminar"
        onclick="removeMinRow('${rowId}')">🗑️</button>
    </div>`
  );
}

function removeMinRow(rowId) {
  const node = document.getElementById(rowId);
  if (node) node.remove();
}
window.removeMinRow = removeMinRow;

function wrapBlock(inner) {
  return `<div lang="es-mx" style="font-family:Montserrat,Arial,sans-serif;background-color:#e2eaf7;padding:35px;margin:25px auto;width:92%;border-radius:16px;box-shadow:0 0 14px rgba(0,0,0,0.22);text-align:justify;border:1px solid rgba(0,0,0,0.06);">
    ${inner}
  </div>`;
}

function sectionTitle(icon, title) {
  return `<h3 style="color:#003366;margin:0 0 14px;text-align:center;font-size:1.18em;">${icon} ${title}</h3>`;
}

function resourceCard({ icon, title, desc, href, btnText, accent, showWhenNoLink = false }) {
  const safeHref = cleanURL(href);

  const t = escapeHTML(title);
  const d = escapeHTML(desc || "");
  const b = escapeHTML(btnText || "Abrir");

  if (!safeHref && !showWhenNoLink) return "";

  if (!safeHref && showWhenNoLink) {
    return `<div style="background-color:#f4f7ff;border-radius:14px;padding:20px;text-align:center;box-shadow:0 0 10px rgba(0,0,0,0.18);border:1px solid rgba(0,0,0,0.06);">
      <div style="font-size:42px;line-height:1;">${icon}</div>
      <h4 style="color:#003366;margin:10px 0 6px;font-size:1.12em;">${t}</h4>
      <p style="font-size:0.98em;color:#556;margin:0;">${d || "Enlace no proporcionado. Este apartado se mantiene visible según el esquema del bloque."}</p>
      <div style="display:inline-block;margin-top:14px;padding:10px 18px;background:rgba(10,74,166,.25);color:#003366;border-radius:10px;font-weight:900;">
        Sin enlace
      </div>
    </div>`;
  }

  return `<div style="background-color:#f4f7ff;border-radius:14px;padding:20px;text-align:center;box-shadow:0 0 10px rgba(0,0,0,0.18);border:1px solid rgba(0,0,0,0.06);">
    <div style="font-size:42px;line-height:1;">${icon}</div>
    <h4 style="color:#003366;margin:10px 0 6px;font-size:1.12em;">${t}</h4>
    ${d ? `<p style="font-size:0.98em;color:#556;margin:0;">${d}</p>` : `<p style="font-size:0.98em;color:#556;margin:0;"></p>`}
    <a href="${safeHref}" target="_blank" rel="noopener"
      style="display:inline-block;margin-top:14px;padding:10px 18px;background:${accent};color:white;border-radius:10px;text-decoration:none;font-weight:900;">
      ${b}
    </a>
  </div>`;
}

function actionButton(href, text) {
  const safeHref = cleanURL(href);
  if (!safeHref) return "";
  const t = escapeHTML(text || "Abrir");

  return `<div style="text-align:center;margin-top:18px;">
    <a href="${safeHref}" target="_blank" rel="noopener"
      style="display:inline-block;padding:12px 26px;background:#0a4aa6;color:white;text-decoration:none;font-weight:900;border-radius:12px;box-shadow:0 0 10px rgba(0,0,0,0.18);">
      ${t}
    </a>
  </div>`;
}

function mathjaxBundle() {
  return `<script>
window.MathJax=window.MathJax||{tex:{inlineMath:[['\\\\(','\\\\)'],['$','$']],displayMath:[['$$','$$'],['\\\\[','\\\\]']]}};
</script>
<script async src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-chtml.js"></script>
<script>
(function(){
  function r(){ if(window.MathJax&&window.MathJax.typesetPromise){ window.MathJax.typesetPromise(); } }
  if(document.readyState==='complete') r(); else window.addEventListener('load', r);
})();
</script>`;
}

function generarHTML() {
  const titulo = escapeHTML(el.titulo.value);
  const intro = escapeHTML(el.intro.value);

  // Formato EXACTO solicitado: iframe embed
  const linkEmbed = ytEmbed(el.video.value);

  // Transcripción (siempre visible)
  const pdfT = cleanURL(el.pdfTrans.value);

  // Recurso profesor (opcional)
  const profTitle = escapeHTML(el.profTitulo.value || "Recurso del profesor");
  const profLink = cleanURL(el.profLink.value);
  const profDesc = escapeHTML(el.profDesc.value || "");

  // Bloque final
  const linkAct = cleanURL(el.linkAct.value);
  const txtBoton = escapeHTML(el.txtBoton.value || "Abrir");
  const txtFinal = escapeHTML(el.txtFinal.value || "");
  const txtTitFinal = escapeHTML(el.txtTitFinal.value || "");
  const emojiFinal = escapeHTML(el.emojiFinal.value || "📝");

  // Minutos
  const rows = Array.from(document.querySelectorAll(".min-row"));
  const minutes = [];

  for (const row of rows) {
    const mInput = row.querySelector('input[id^="m_"]');
    const tInput = row.querySelector('input[id^="t_"]');
    const mRaw = (mInput?.value || "").trim();
    if (!mRaw) continue;

    const sec = toSeconds(mRaw);
    const mmss = formatMin(mRaw);
    const texto = escapeHTML((tInput?.value || "").trim());
    minutes.push({ sec, mmss, texto });
  }

  minutes.sort((a, b) => a.sec - b.sec);

  const header = `
    <h2 style="color:#003366;text-align:center;font-weight:900;margin:0 0 14px;letter-spacing:0.02em;">
      ${titulo}
    </h2>
    <p style="font-size:1.05em;color:#223;line-height:1.7;margin:0 0 14px;">
      ${intro}
    </p>
  `;

  // ===== VIDEO (EXACTO) =====
  const videoBlock = linkEmbed
    ? `<!-- CONTENEDOR DEL VIDEO -->
  <div
    style="margin-top: 25px; border-radius: 16px; background-color: #e9f4ff; padding: 15px; text-align: center; box-shadow: 0 0 6px rgba(0, 0, 0, 0.5);">
    <iframe
      style="border-radius: 12px; box-shadow: inset 4px 4px 8px #cbd5e1,          inset -4px -4px 8px #ffffff;"
      src="${linkEmbed}" width="100%" height="260"
      frameborder="0" allowfullscreen="allowfullscreen">
    </iframe></div>`
    : `<div style="margin-top:18px;padding:14px;background:#fff3cd;border-radius:12px;border:1px solid rgba(0,0,0,0.08);">
        <strong>⚠️ No se detectó un link de YouTube válido.</strong>
      </div>`;

  // ===== MINUTOS CLAVE (EXACTO) =====
  const minutosBlock = minutes.length && linkEmbed
    ? `<details
    style="margin-top: 30px; border-radius: 10px; background-color: #f5f8ff; padding: 18px; box-shadow: 0 0 6px rgba(0, 0, 0, 0.5);">
    <summary
      style="cursor: pointer; font-weight: bold; color: #004a99; font-size: 1.1em;">
      🕐 Minutos claves</summary>
    <div style="margin-top: 15px; font-size: 1.05em; color: #333;">
      <p>Accede rápidamente a los momentos clave del video:</p>
      <ul style="list-style-type: none; padding-left: 10px; line-height: 1.8;">
        ${minutes.map((it) => {
          const href = embedStartLink(linkEmbed, it.sec);
          return `<!-- ENLACE A ${it.mmss} -->
        <li>🔹 <strong>Minuto <a
              style="color: #0056b3; text-decoration: none; font-weight: bold;"
              href="${href}"
              target="_blank" rel="noopener"> ${it.mmss} </a>: </strong> <span class="mjx">${it.texto}</span></li>`;
        }).join("")}
      </ul>
    </div>
  </details>`
    : (minutes.length && !linkEmbed)
      ? `<div style="margin-top:18px;padding:14px;background:#fff3cd;border-radius:12px;border:1px solid rgba(0,0,0,0.08);">
          <strong>⚠️ Hay minutos clave, pero falta un link de YouTube válido para generar enlaces.</strong>
        </div>`
      : "";

  // ===== TRANSCRIPCIÓN (SIEMPRE) =====
  const transcripcionCard = resourceCard({
    icon: "📑",
    title: "Transcripción",
    desc: pdfT
      ? "Archivo PDF con la transcripción."
      : "Enlace no proporcionado. Este apartado se mantiene visible según el esquema del bloque.",
    href: pdfT,
    btnText: "Abrir transcripción",
    accent: "#0a4aa6",
    showWhenNoLink: true,
  });

  const transcripcionWrapStyle = profLink ? "" : `style="max-width:620px;margin:0 auto;"`;

  const transcripcionBlock = `<div style="margin-top:26px;">
      ${sectionTitle("📑", "Transcripción")}
      <div ${transcripcionWrapStyle}>
        ${transcripcionCard}
      </div>
    </div>`;

  // ===== RECURSO PROFESOR (OPCIONAL) =====
  const profBlock = profLink
    ? `<div style="margin-top:18px;">
        ${sectionTitle("🧠", profTitle)}
        ${resourceCard({
          icon: "🔗",
          title: profTitle,
          desc: profDesc,
          href: profLink,
          btnText: "Abrir recurso",
          accent: "#2a6cd6",
        })}
      </div>`
    : "";

  // ===== BLOQUE FINAL (OPCIONAL) =====
  const actividadBlock = linkAct
    ? `<div style="background:#cfe2ff;padding:20px;border-radius:14px;margin-top:26px;border-left:7px solid #0a4aa6;box-shadow:0 0 10px rgba(0,0,0,0.16);">
        <h3 style="color:#003366;margin:0 0 10px;">${emojiFinal} ${txtTitFinal}</h3>
        <p style="font-size:1.04em;color:#223;margin:0;">${txtFinal}</p>
      </div>
      ${actionButton(linkAct, txtBoton)}`
    : "";

  const inner = [header, videoBlock, minutosBlock, transcripcionBlock, profBlock, actividadBlock]
    .filter(Boolean)
    .join("");

  const outputHTML = wrapBlock(inner) + mathjaxBundle();

  el.codigo.value = outputHTML;
  el.resultado.style.display = "block";
  el.resultado.scrollIntoView({ behavior: "smooth", block: "start" });
}

function copiar() {
  const text = el.codigo.value;
  navigator.clipboard
    .writeText(text)
    .then(() => toast("Código copiado ✔", true))
    .catch(() => toast("No se pudo copiar (permiso del navegador).", false));
}

window.addEventListener("DOMContentLoaded", () => {
  el.btnAddMin.addEventListener("click", addMinRow);
  el.btnGenerar.addEventListener("click", generarHTML);
  el.btnCopiar.addEventListener("click", copiar);
  addMinRow();
});
