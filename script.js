let minutoCount = 0;

const $ = (id) => document.getElementById(id);

function escapeHTML(s) {
    return String(s ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function cleanURL(u) {
    u = String(u ?? "").trim();
    if (!u) return "";
    return u;
}

function embedYT(url) {
    url = cleanURL(url);
    if (!url) return "";

    if (url.includes("watch?v=")) {
        return "https://www.youtube.com/embed/" + url.split("watch?v=")[1].split("&")[0];
    }
    if (url.includes("youtu.be/")) {
        return "https://www.youtube.com/embed/" + url.split("youtu.be/")[1].split("?")[0];
    }
    if (url.includes("/embed/")) {
        const id = url.split("/embed/")[1].split(/[?&]/)[0];
        return "https://www.youtube.com/embed/" + id;
    }
    return url;
}

function watchYT(url) {
    url = cleanURL(url);
    if (!url) return "";

    if (url.includes("watch?v=")) {
        return "https://www.youtube.com/watch?v=" + url.split("watch?v=")[1].split("&")[0];
    }
    if (url.includes("youtu.be/")) {
        return "https://www.youtube.com/watch?v=" + url.split("youtu.be/")[1].split("?")[0];
    }
    if (url.includes("/embed/")) {
        return "https://www.youtube.com/watch?v=" + url.split("/embed/")[1].split(/[?&]/)[0];
    }
    return url;
}

function formatMin(m) {
    m = String(m ?? "").trim();
    if (!m) return "";

    if (!m.includes(":")) return String(m).padStart(2, "0") + ":00";

    let [mm, ss] = m.split(":");
    mm = (mm || "0").trim();
    ss = (ss || "0").trim();

    return String(mm).padStart(2, "0") + ":" + String(ss).padStart(2, "0");
}

function toSeconds(m) {
    m = String(m ?? "").trim();
    if (!m) return 0;

    if (!m.includes(":")) {
        const mm = parseInt(m, 10);
        return Number.isFinite(mm) ? mm * 60 : 0;
    }

    let [mm, ss] = m.split(":");
    mm = parseInt(mm, 10);
    ss = parseInt(ss, 10);

    mm = Number.isFinite(mm) ? mm : 0;
    ss = Number.isFinite(ss) ? ss : 0;

    return mm * 60 + ss;
}

function setOptionalVisibility() {
    const showT = $("toggle_trans").checked;
    const showN = $("toggle_notas").checked;

    $("wrap_pdf_trans").style.display = showT ? "block" : "none";
    $("wrap_pdf_notas").style.display = showN ? "block" : "none";

    $("pdf_trans").disabled = !showT;
    $("pdf_notas").disabled = !showN;
}

function addMinRow() {
    minutoCount++;
    const cont = $("minutos-container");

    const rowId = `row_${minutoCount}`;
    const html = `
    <div class="min-row" id="${rowId}">
      <div class="field">
        <label>Minuto ${minutoCount} (mm:ss o mm)</label>
        <input type="text" id="m_${minutoCount}" placeholder="Ej: 1:30" />
      </div>

      <div class="field">
        <label>Texto que acompaña al minuto ${minutoCount}</label>
        <input type="text" id="t_${minutoCount}" placeholder="Ej: explicación del concepto" />
      </div>

      <button class="btn btn-ghost" type="button" aria-label="Eliminar" title="Eliminar"
        onclick="removeMinRow('${rowId}')">🗑️</button>
    </div>
  `;
    cont.insertAdjacentHTML("beforeend", html);
}

function removeMinRow(rowId) {
    const el = $(rowId);
    if (el) el.remove();
}

function buildResourceCard({ icon, title, desc, href, btnText, accent }) {
    const safeHref = cleanURL(href);
    if (!safeHref) return "";

    const safeTitle = escapeHTML(title);
    const safeDesc = escapeHTML(desc);
    const safeBtn = escapeHTML(btnText || "Abrir");

    return `
    <div style="background-color:#f4f7ff; border-radius:14px; padding:20px; text-align:center; box-shadow:0 0 10px rgba(0,0,0,0.18); border:1px solid rgba(0,0,0,0.06);">
      <div style="font-size:42px; line-height:1;">${icon}</div>
      <h4 style="color:#003366; margin:10px 0 6px; font-size:1.12em;">${safeTitle}</h4>
      <p style="font-size:0.96em; color:#556; margin:0;">${safeDesc}</p>
      <a href="${safeHref}" target="_blank" rel="noopener"
        style="display:inline-block; margin-top:14px; padding:10px 18px; background:${accent}; color:white; border-radius:10px; text-decoration:none; font-weight:700;">
        ${safeBtn}
      </a>
    </div>
  `;
}

function generarHTML() {
    const titulo = escapeHTML($("titulo_bloque").value);
    const intro = escapeHTML($("intro").value);

    const rawVideo = cleanURL($("link_video").value);
    const linkEmbed = embedYT(rawVideo);
    const linkWatch = watchYT(rawVideo);

    const incluirTrans = $("toggle_trans").checked;
    const incluirNotas = $("toggle_notas").checked;

    const pdfT = incluirTrans ? cleanURL($("pdf_trans").value) : "";
    const pdfN = incluirNotas ? cleanURL($("pdf_notas").value) : "";

    const linkAct = cleanURL($("link_actividad").value);
    const txtBoton = escapeHTML($("texto_boton").value || "Abrir");
    const txtFinal = escapeHTML($("texto_bloque_final").value);
    const txtTituFinal = escapeHTML($("texto_titulo_final").value);
    const emojiFinal = escapeHTML($("emoji_final").value);

    const minuteRows = Array.from(document.querySelectorAll(".min-row"));
    const minutes = [];

    for (const row of minuteRows) {
        const mInput = row.querySelector('input[id^="m_"]');
        const tInput = row.querySelector('input[id^="t_"]');

        const mRaw = (mInput?.value || "").trim();
        if (!mRaw) continue;

        const sec = toSeconds(mRaw);
        const mmss = formatMin(mRaw);
        const texto = escapeHTML(tInput?.value || "");

        minutes.push({ sec, mmss, texto });
    }

    minutes.sort((a, b) => a.sec - b.sec);

    let listaMin = "";
    for (const it of minutes) {
        const href = linkWatch ? `${linkWatch}&t=${it.sec}s` : "";
        const linkPart = href
            ? `<a style="color:#0a4aa6; text-decoration:none; font-weight:800;" href="${href}" target="_blank" rel="noopener">${it.mmss}</a>`
            : `<span style="font-weight:800; color:#0a4aa6;">${it.mmss}</span>`;

        listaMin += `
      <li style="padding:10px 12px; border-radius:12px; background:#ffffff; box-shadow:0 0 8px rgba(0,0,0,0.12); margin:10px 0; border:1px solid rgba(0,0,0,0.06);">
        <div style="font-size:1.02em; color:#223;">
          🔹 <strong>Minuto ${linkPart}:</strong> ${it.texto}
        </div>
      </li>
    `;
    }

    const minutosBlock = minutes.length
        ? `
      <details style="margin-top:30px; border-radius:14px; background-color:#f5f8ff; padding:18px; box-shadow:0 0 10px rgba(0,0,0,0.18); border:1px solid rgba(0,0,0,0.06);">
        <summary style="cursor:pointer; font-weight:800; color:#004a99; font-size:1.12em;">
          🕐 Minutos clave
        </summary>

        <div style="margin-top:15px; font-size:1.02em; color:#333;">
          <p style="margin:0 0 12px;">Accede rápidamente a los momentos clave del video:</p>
          <ul style="list-style:none; padding-left:0; margin:0;">
            ${listaMin}
          </ul>
        </div>
      </details>
    `
        : "";

    const cards = [
        buildResourceCard({
            icon: "📑",
            title: "Transcripción",
            desc: "Archivo PDF con la transcripción.",
            href: pdfT,
            btnText: "Abrir",
            accent: "#0a4aa6"
        }),
        buildResourceCard({
            icon: "📕",
            title: "Notas",
            desc: "Resumen y puntos clave.",
            href: pdfN,
            btnText: "Abrir",
            accent: "#2a6cd6"
        })
    ].filter(Boolean);

    const recursosBlock = cards.length
        ? `
      <div style="margin-top:30px;">
        <h3 style="color:#003366; margin:0 0 14px; text-align:center; font-size:1.18em;">📎 Recursos</h3>
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(240px, 1fr)); gap:18px;">
          ${cards.join("")}
        </div>
      </div>
    `
        : "";

    const actividadBlock = linkAct
        ? `
      <div style="background:#cfe2ff; padding:20px; border-radius:14px; margin-top:30px; border-left:7px solid #0a4aa6; box-shadow:0 0 10px rgba(0,0,0,0.16);">
        <h3 style="color:#003366; margin:0 0 10px;">${emojiFinal} ${txtTituFinal}</h3>
        <p style="font-size:1.04em; color:#223; margin:0;">${txtFinal}</p>
      </div>

      <div style="text-align:center; margin-top:18px;">
        <a href="${linkAct}" target="_blank" rel="noopener"
          style="display:inline-block; padding:12px 26px; background:#0a4aa6; color:white; text-decoration:none; font-weight:800; border-radius:12px; box-shadow:0 0 10px rgba(0,0,0,0.18);">
          ${txtBoton}
        </a>
      </div>
    `
        : "";

    const videoBlock = linkEmbed
        ? `
      <p style="margin-top:16px;"><strong>Haz clic en el siguiente video para comenzar.</strong></p>

      <div style="margin-top: 18px; border-radius: 16px; background-color: #e9f4ff; padding: 15px; text-align: center; box-shadow: 8px 8px 20px rgba(203,213,225,0.9), -8px -8px 20px rgba(255,255,255,0.9); border:1px solid rgba(0,0,0,0.05);">
        <div style="position: relative; width: 100%; padding-top: 56.25%; border-radius: 12px; overflow: hidden; box-shadow: inset 4px 4px 8px rgba(203,213,225,0.9), inset -4px -4px 8px rgba(255,255,255,0.9);">
          <iframe
            style="position:absolute; top:0; left:0; width:100%; height:100%; border:0;"
            title="Video del curso"
            src="${linkEmbed}"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowfullscreen="allowfullscreen"></iframe>
        </div>
      </div>
    `
        : `
      <div style="margin-top:18px; padding:14px; background:#fff3cd; border-radius:12px; border:1px solid rgba(0,0,0,0.08);">
        <strong>⚠️ No se detectó un link de YouTube válido.</strong>
      </div>
    `;

    const html = `<div lang="es-mx" style="font-family: Montserrat, Arial, sans-serif; background-color: #e2eaf7; padding: 35px; margin: 25px auto; width: 92%; border-radius: 16px; box-shadow: 0 0 14px rgba(0,0,0,0.22); text-align: justify; border:1px solid rgba(0,0,0,0.06);">
    <h2 style="color:#003366; text-align:center; font-weight:900; margin:0 0 14px; letter-spacing:0.2px;">
      ${titulo}
    </h2>

    <p style="font-size:1.05em; color:#223; line-height:1.7; margin:0 0 14px;">
      ${intro}
    </p>

    ${videoBlock}
    ${minutosBlock}
    ${recursosBlock}
    ${actividadBlock}
  </div>`;

    $("codigo").value = html;
    $("resultado").style.display = "block";
    $("resultado").scrollIntoView({ behavior: "smooth", block: "start" });
}

function copiar() {
    const t = $("codigo");
    t.focus();
    t.select();
    navigator.clipboard.writeText(t.value);
    toast("Código copiado ✔");
}

function toast(msg) {
    const el = document.createElement("div");
    el.className = "toast";
    el.textContent = msg;
    document.body.appendChild(el);
    requestAnimationFrame(() => el.classList.add("show"));
    setTimeout(() => {
        el.classList.remove("show");
        setTimeout(() => el.remove(), 200);
    }, 1400);
}

window.addEventListener("DOMContentLoaded", () => {
    $("btnAddMin").addEventListener("click", addMinRow);
    $("btnGenerar").addEventListener("click", generarHTML);
    $("btnCopiar").addEventListener("click", copiar);

    $("toggle_trans").addEventListener("change", setOptionalVisibility);
    $("toggle_notas").addEventListener("change", setOptionalVisibility);

    setOptionalVisibility();
});
