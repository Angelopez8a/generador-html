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
  return u;
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

/** Tarjeta EXACTA del estilo que pegaste (Transcripción / Notas / Recurso) */
function cardExacta({ emoji, titulo, desc, href, colorBoton, textoBoton = "Descargar" }) {
  const link = cleanURL(href);
  if (!link) return ""; 

  const t = escapeHTML(titulo);
  const d = escapeHTML(desc);

  return `<div
      style="background-color: #f4f7ff; border-radius: 14px; padding: 20px; text-align: center; box-shadow: 8px 8px 18px #c9d3e4, -8px -8px 18px #ffffff;">
      <div style="font-size: 40px; margin-bottom: 10px;">${emoji}</div>
      <h4 style="margin: 0; color: #003366;">${t}</h4>
      <p style="font-size: 0.95em; color: #555; margin-top: 5px;">${d}</p>
      <a style="display: inline-block; margin-top: 12px; padding: 10px 18px; background-color: ${colorBoton}; color: white; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 0.95em;"
        href="${link}" target="_blank" rel="noopener"> ${escapeHTML(textoBoton)} </a>
    </div>`;
}

function cardTranscripcionSiempre({ href }) {
  const link = cleanURL(href);

  if (!link) {
    return `<div
      style="background-color: #f4f7ff; border-radius: 14px; padding: 20px; text-align: center; box-shadow: 8px 8px 18px #c9d3e4, -8px -8px 18px #ffffff;">
      <div style="font-size: 40px; margin-bottom: 10px;"></div>
      <h4 style="margin: 0; color: #003366;">Transcripción</h4>
      <p style="font-size: 0.95em; color: #555; margin-top: 5px;">Archivo PDF con la transcripción completa del video.</p>
      <div style="display: inline-block; margin-top: 12px; padding: 10px 18px; background-color: rgba(0,86,179,.18); color: #003366; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 0.95em;">
        Enlace no proporcionado
      </div>
    </div>`;
  }

  return cardExacta({
    emoji: "📄",
    desc: "Archivo PDF con la transcripción completa del video.",
    href: link,
    colorBoton: "#0056b3",
    textoBoton: "Descargar",
  });
}

function generarHTML() {
  const titulo = escapeHTML(el.titulo.value);

  const introRaw = String(el.intro.value ?? "").trim();
  const introPars = introRaw
    ? introRaw
        .split(/\n\s*\n+/) 
        .map((p) => p.trim())
        .filter(Boolean)
    : [];

  const introHTML = introPars
    .map(
      (p) =>
        `<p style="font-size: 1.05em; color: #333; line-height: 1.6;">${escapeHTML(p)}</p>`
    )
    .join("\n  ");

  const invitacionStrong = introPars.length
    ? `<p><strong>${escapeHTML(introPars[introPars.length - 1])}</strong></p>`
    : "";

  const linkEmbed = ytEmbed(el.video.value);

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

  const transLink = cleanURL(el.pdfTrans.value);

  const profLink = cleanURL(el.profLink.value);
  const profTitle = String(el.profTitulo.value || "").trim();
  const profDesc = String(el.profDesc.value || "").trim();

  const linkAct = cleanURL(el.linkAct.value);
  const txtBoton = escapeHTML(el.txtBoton.value || "🔗 Ir a la actividad");
  const txtFinal = escapeHTML(el.txtFinal.value || "");
  const txtTitFinal = escapeHTML(el.txtTitFinal.value || "🚀 Continúa con la siguiente actividad");
  const emojiFinal = escapeHTML(el.emojiFinal.value || "🚀");

  const videoBlock = linkEmbed
    ? `<!-- CONTENEDOR DEL VIDEO (CORREGIDO 16:9) -->
  <div
    style="margin-top: 25px; border-radius: 16px; background-color: #e9f4ff; padding: 15px; text-align: center; box-shadow: 8px 8px 20px #cbd5e1, -8px -8px 20px #ffffff;">
    <div
      style="position: relative; width: 100%; padding-top: 56.25%; border-radius: 12px; overflow: hidden; box-shadow: inset 4px 4px 8px #cbd5e1,                         inset -4px -4px 8px #ffffff;">
      <iframe
        style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0;"
        title="${titulo}"
        src="${linkEmbed}"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen="allowfullscreen">
      </iframe></div>
  </div>`
    : "";

  const minutosBlock = minutes.length && linkEmbed
    ? `<!-- SECCIÓN COLAPSABLE -->
  <details
    style="margin-top: 30px; border-radius: 10px; background-color: #f5f8ff; padding: 18px; box-shadow: 8px 8px 16px #cdd6e3,           -8px -8px 16px #ffffff;">
    <summary
      style="cursor: pointer; font-weight: bold; color: #004a99; font-size: 1.1em;">
      📝 Mostrar minutos importantes</summary>
    <div style="margin-top: 15px; font-size: 1.05em; color: #333;">
      <p>Accede rápidamente a los momentos clave del video:</p>
      <ul style="list-style-type: none; padding-left: 10px; line-height: 1.8;">
        ${minutes
          .map((it) => {
            const href = embedStartLink(linkEmbed, it.sec);
            return `<li>🔹 <strong>Minuto <a
              style="color: #0056b3; text-decoration: none; font-weight: bold;"
              href="${href}"
              target="_blank" rel="noopener">${it.mmss}</a>:</strong> ${it.texto}</li>`;
          })
          .join("\n        ")}
      </ul>
    </div>
  </details>`
    : "";

  const cardTrans = cardTranscripcionSiempre({ href: transLink });

  const profEmoji = /nota/i.test(profTitle) ? "📝" : "📝"; // en tu ejemplo es 📝
  const cardProf = profLink
    ? cardExacta({
        emoji: profEmoji,
        titulo: profTitle || "Notas del video",
        desc: profDesc || "Resumen y puntos clave del video.",
        href: profLink,
        colorBoton: "#2a6cd6",
        textoBoton: "Descargar",
      })
    : "";

  const tarjetas = [cardTrans, cardProf].filter(Boolean);
  const tarjetasBlock =
    tarjetas.length > 0
      ? `<!-- TARJETAS -->
  <div
    style="margin-top: 30px; display: grid; grid-template-columns: ${tarjetas.length === 1 ? "1fr" : "1fr 1fr"}; gap: 25px;">
    ${tarjetas.join("\n    ")}
  </div>`
      : "";

  const bloqueFinal =
    linkAct
      ? `<!-- BLOQUE FINAL -->
  <div
    style="background-color: #cfe2ff; padding: 20px; border-radius: 10px; margin-top: 30px; border-left: 6px solid #0056b3;">
    <h3 style="color: #003366; margin-bottom: 10px;">${emojiFinal} ${txtTitFinal}</h3>
    <p style="font-size: 1.05em; color: #333; line-height: 1.6;">${txtFinal}</p>
  </div>
  <!-- BOTÓN -->
  <div style="text-align: center; margin-top: 20px;"><a
      style="display: inline-block; padding: 12px 25px; background-color: #0056b3; color: white; text-decoration: none; font-weight: bold; border-radius: 8px; box-shadow: 0 3px 6px rgba(0,0,0,0.2); transition: 0.3s;"
      href="${linkAct}" target="_blank" rel="noopener"> ${txtBoton} </a></div>`
      : "";

  const outputHTML = `<!-- CONTENEDOR PRINCIPAL -->
<div lang="es-mx"
  style="font-family: Montserrat, sans-serif; background-color: #e2eaf7; padding: 35px; margin: 25px auto; width: 90%; border-radius: 12px; box-shadow: 0 4px 8px rgba(0,0,0,0.1); text-align: justify; position: relative;">
  <!-- TÍTULO DEL BLOQUE -->
  <h2
    style="color: #003366; text-align: center; font-weight: bold; margin-bottom: 15px;">
    ${titulo}</h2>
  <!-- PÁRRAFO DE INTRODUCCIÓN -->
  ${introHTML}
  <!-- INVITACIÓN -->
  ${invitacionStrong}
  ${videoBlock}
  ${minutosBlock}
  ${tarjetasBlock}
  ${bloqueFinal}
</div>
${mathjaxBundle()}`;

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
