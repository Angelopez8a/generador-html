let minutoCount = 0;

function agregarMinuto() {
    minutoCount++;
    const cont = document.getElementById("minutos-container");

    cont.innerHTML += `
    <div style="padding:10px 0;">
        <label>Minuto ${minutoCount} (mm:ss o mm)</label>
        <input type="text" id="m_${minutoCount}" placeholder="Ej: 1:30">

        <label>Texto que acompaña al minuto ${minutoCount}</label>
        <input type="text" id="t_${minutoCount}" placeholder="Ej: explicación del concepto">
    </div>
    `;
}

function embedYT(url) {
    if (url.includes("watch?v=")) {
        return "https://www.youtube.com/embed/" + url.split("watch?v=")[1].split("&")[0];
    }
    if (url.includes("youtu.be/")) {
        return "https://www.youtube.com/embed/" + url.split("youtu.be/")[1].split("?")[0];
    }
    return url;
}

function formatMin(m) {
    if (!m.includes(":")) return m.padStart(2,"0") + ":00";
    let [mm, ss] = m.split(":");
    return mm.padStart(2,"0") + ":" + ss.padStart(2,"0");
}

function toSeconds(m) {
    let [mm, ss] = m.split(":");
    return parseInt(mm)*60 + parseInt(ss);
}

function generarHTML() {

    // Datos principales
    const titulo = document.getElementById("titulo_bloque").value;
    const intro = document.getElementById("intro").value;
    const link = embedYT(document.getElementById("link_video").value);
    const pdfT = document.getElementById("pdf_trans").value;
    const pdfN = document.getElementById("pdf_notas").value;
    const linkAct = document.getElementById("link_actividad").value;
    const txtBoton = document.getElementById("texto_boton").value;
    const txtFinal = document.getElementById("texto_bloque_final").value;
    const txtTituFinal = document.getElementById("texto_titulo_final").value;
    const emojiFinal = document.getElementById("emoji_final").value;

    // Minutos
    let listaMin = "";
    for (let i = 1; i <= minutoCount; i++) {
        let m = document.getElementById("m_" + i).value.trim();
        if (!m) continue;
        let mmss = formatMin(m);
        let sec = toSeconds(mmss);
        let texto = document.getElementById("t_" + i).value;

        listaMin += `
        <li>
          🔹 <strong>Minuto
            <a
              style="color:#0056b3; text-decoration:none; font-weight:bold;"
              href="${link}?start=${sec}"
              target="_blank"
              rel="noopener">
              ${mmss}
            </a>:
          </strong>
          ${texto}
        </li>
`;
    }

    // HTML generado
    const html = `<!-- CONTENEDOR PRINCIPAL -->
<div lang="es-mx"
  style="font-family: Montserrat, sans-serif; background-color: #e2eaf7; padding: 35px; margin: 25px auto; width: 90%; border-radius: 12px; box-shadow: 0 0 6px rgba(0,0,0,0.5); text-align: justify; position: relative;">

  <h2 style="color:#003366; text-align:center; font-weight:bold; margin-bottom:15px;">
    ${titulo}
  </h2>

  <p style="font-size:1.05em; color:#333; line-height:1.6;">
    ${intro}
  </p>

  <p><strong>Haz clic en el siguiente video para comenzar.</strong></p>

  <!-- VIDEO 16:9 -->
  <div
    style="margin-top: 25px; border-radius: 16px; background-color: #e9f4ff; padding: 15px; text-align: center; box-shadow: 8px 8px 20px #cbd5e1, -8px -8px 20px #ffffff;">
    <div
      style="position: relative; width: 100%; padding-top: 56.25%; border-radius: 12px; overflow: hidden; box-shadow: inset 4px 4px 8px #cbd5e1, inset -4px -4px 8px #ffffff;">
      <iframe
        style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0;"
        title="Video del curso"
        src="${link}"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen="allowfullscreen">
      </iframe>
    </div>
  </div>

  <details style="margin-top:30px; border-radius:10px; background-color:#f5f8ff; padding:18px; box-shadow:0 0 6px rgba(0,0,0,0.5);">
    <summary style="cursor:pointer; font-weight:bold; color:#004a99; font-size:1.1em;">
      🕐 Minutos clave
    </summary>

    <div style="margin-top:15px; font-size:1.05em; color:#333;">
      <p>Accede rápidamente a los momentos clave del video:</p>
      <ul style="list-style:none; padding-left:10px; line-height:1.8;">
        ${listaMin}
      </ul>
    </div>
  </details>

  <div style="margin-top:30px; display:grid; grid-template-columns:1fr 1fr; gap:25px;">

    <div style="background-color:#f4f7ff; border-radius:14px; padding:20px; text-align:center; box-shadow:0 0 6px rgba(0,0,0,0.5);">
      <div style="font-size:40px;">📑</div>
      <h4 style="color:#003366; margin:0;">Transcripción</h4>
      <p style="font-size:0.95em; color:#555;">Archivo PDF con la transcripción.</p>
      <a href="${pdfT}" style="display:inline-block; margin-top:12px; padding:10px 18px; background:#0056b3; color:white; border-radius:8px; text-decoration:none; font-weight:bold;">Descargar</a>
    </div>

    <div style="background-color:#f4f7ff; border-radius:14px; padding:20px; text-align:center; box-shadow:0 0 6px rgba(0,0,0,0.5);">
      <div style="font-size:40px;">📕</div>
      <h4 style="color:#003366; margin:0;">Notas</h4>
      <p style="font-size:0.95em; color:#555;">Resumen y puntos clave.</p>
      <a href="${pdfN}" style="display:inline-block; margin-top:12px; padding:10px 18px; background:#2a6cd6; color:white; border-radius:8px; text-decoration:none; font-weight:bold;">Descargar</a>
    </div>

  </div>

  <div style="background:#cfe2ff; padding:20px; border-radius:10px; margin-top:30px; border-left:6px solid #0056b3;">
    <h3 style="color:#003366;">${emojiFinal} ${txtTituFinal}</h3>
    <p style="font-size:1.05em; color:#333;">${txtFinal}</p>
  </div>

  <div style="text-align:center; margin-top:20px;">
    <a href="${linkAct}" style="display:inline-block; padding:12px 25px; background:#0056b3; color:white; text-decoration:none; font-weight:bold; border-radius:8px;">
      ${txtBoton}
    </a>
  </div>

</div>

</div>`;
    document.getElementById("codigo").value = html;
    document.getElementById("resultado").style.display = "block";
}

function copiar() {
    let t = document.getElementById("codigo");
    t.select();
    navigator.clipboard.writeText(t.value);
    alert("Código copiado ✔");
}
