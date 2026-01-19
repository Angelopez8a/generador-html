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

function watchYT(url) {
  const u = cleanURL(url);
  if (!u) return "";

  if (u.includes("watch?v=")) return "https://www.youtube.com/watch?v=" + u.split("watch?v=")[1].split("&")[0];
  if (u.includes("youtu.be/")) return "https://www.youtube.com/watch?v=" + u.split("youtu.be/")[1].split("?")[0];
  if (u.includes("/embed/")) return "https://www.youtube.com/watch?v=" + u.split("/embed/")[1].split(/[?&]/)[0];
  return u;
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
// Para que el onclick siempre encuentre la función:
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

  // Caso normal: no hay link y no queremos mostrar nada
  if (!safeHref && !showWhenNoLink) return "";

  // Caso “siempre”: no hay link pero mostramos aviso
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

  // Caso con link
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

  const linkWatch = watchYT(el.video.value);

  // Transcripción (siempre visible)
  const pdfT = cleanURL(el.pdfTrans.value);

  const profTitle = escapeHTML(el.profTitulo.value || "Recurso del profesor");
  const profLink = cleanURL(el.profLink.value);
  const profDesc = escapeHTML(el.profDesc.value || "");

  const linkAct = cleanURL(el.linkAct.value);
  const txtBoton = escapeHTML(el.txtBoton.value || "Abrir");
  const txtFinal = escapeHTML(el.txtFinal.value || "");
  const txtTitFinal = escapeHTML(el.txtTitFinal.value || "");
  const emojiFinal = escapeHTML(el.emojiFinal.value || "📝");

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

  const videoBlock = linkWatch
    ? `<div style="margin-top:18px;padding:16px;border-radius:14px;background:#e9f4ff;border:1px solid rgba(0,0,0,0.06);box-shadow:0 0 10px rgba(0,0,0,0.14);">
        <div style="display:flex;gap:12px;align-items:flex-start;">
          <div style="font-size:34px;line-height:1;">🎥</div>
          <div style="flex:1;">
            <p style="margin:0 0 8px;color:#223;line-height:1.6;">
              <strong>Video del curso:</strong> abre el enlace para ver el contenido.
            </p>
            <a href="${linkWatch}" target="_blank" rel="noopener"
              style="display:inline-block;padding:10px 16px;background:#0a4aa6;color:white;text-decoration:none;font-weight:900;border-radius:12px;">
              Ver video en YouTube
            </a>
          </div>
        </div>
      </div>`
    : `<div style="margin-top:18px;padding:14px;background:#fff3cd;border-radius:12px;border:1px solid rgba(0,0,0,0.08);">
        <strong>⚠️ No se detectó un link de YouTube válido.</strong>
      </div>`;

  const minutosBlock = minutes.length
    ? `<details style="margin-top:26px;border-radius:14px;background-color:#f5f8ff;padding:18px;box-shadow:0 0 10px rgba(0,0,0,0.18);border:1px solid rgba(0,0,0,0.06);">
        <summary style="cursor:pointer;font-weight:900;color:#004a99;font-size:1.12em;">🕐 Minutos clave</summary>
        <div style="margin-top:15px;font-size:1.02em;color:#333;">
          <p style="margin:0 0 12px;">Accede rápidamente a los momentos clave del video:</p>
          <ul style="list-style:none;padding-left:0;margin:0;">
            ${minutes.map((it) => {
              const href = linkWatch ? `${linkWatch}&t=${it.sec}s` : "";
              const linkPart = href
                ? `<a style="color:#0a4aa6;text-decoration:none;font-weight:900;" href="${href}" target="_blank" rel="noopener">${it.mmss}</a>`
                : `<span style="font-weight:900;color:#0a4aa6;">${it.mmss}</span>`;

              return `<li style="padding:10px 12px;border-radius:12px;background:#ffffff;box-shadow:0 0 8px rgba(0,0,0,0.12);margin:10px 0;border:1px solid rgba(0,0,0,0.06);">
                <div style="font-size:1.02em;color:#223;">
                  🔹 <strong>Minuto ${linkPart}:</strong> <span class="mjx">${it.texto}</span>
                </div>
              </li>`;
            }).join("")}
          </ul>
        </div>
      </details>`
    : "";

  // Transcripción SIEMPRE (con o sin link)
  const transcripcionCard = resourceCard({
    icon: "📑",
    title: "Transcripción",
    desc: pdfT ? "Archivo PDF con la transcripción." : "Enlace no proporcionado. Este apartado se mantiene visible según el esquema del bloque.",
    href: pdfT,
    btnText: "Abrir transcripción",
    accent: "#0a4aa6",
    showWhenNoLink: true,
  });

  // Si no hay recurso del profesor, centramos visualmente la transcripción
  const transcripcionWrapStyle = profLink
    ? ""
    : `style="max-width:620px;margin:0 auto;"`;

  const transcripcionBlock = `<div style="margin-top:26px;">
      ${sectionTitle("📑", "Transcripción")}
      <div ${transcripcionWrapStyle}>
        ${transcripcionCard}
      </div>
    </div>`;

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
