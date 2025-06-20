const tareas = [
  "🌿 Regar las plantas",
  "🔌 Apagar aparatos eléctricos",
  "🧹 Limpiar pupitre",
  "🚫 Evitar bolsas plásticas",
  "💧 Usar botella reutilizable",
  "🍃 Separar residuos orgánicos",
  "🧃 Separar residuos inorgánicos",
  "🌱 Cuidar áreas verdes",
  "🌾 Hacer composta",
  "🎨 No rayar paredes",
  "🚿 Cerrar el grifo mientras te lavas las manos"

];

const frases = [
  "🌍 Cada acción cuenta para salvar el planeta.",
  "💡 Pequeños cambios, grandes impactos.",
  "🌳 Cuida la tierra, es nuestro único hogar.",
  "♻️ Reduce, reutiliza y recicla.",
  "🌿 La tierra no es una herencia, es un préstamo."
];

let usuarioActual = null;
let puntos = 0;
let video = null;
let canvas = null;
let context = null;
let currentStream = null;
let tareaSeleccionada = "";

// === LOGIN ===
function iniciarSesion() {
  const nombre = document.getElementById("nombreUsuario").value.trim();
  if (!nombre) return alert("Ingresa un nombre");
  usuarioActual = nombre;
  localStorage.setItem("usuarioActivo", usuarioActual);
  cargarDatosUsuario();
  mostrarFraseAleatoria();
  mostrarSeccion("pantallaInicio");
}

// === FRASES ECOLÓGICAS ===
function mostrarFraseAleatoria() {
  const f = frases[Math.floor(Math.random() * frases.length)];
  document.getElementById("fraseEcologica").textContent = f;
}

// === TEMAS ===
function cambiarTema(valor) {
  document.body.className = "tema-" + valor;
  guardarEnPerfil("tema", valor);
}

// === SECCIONES ===
function mostrarSeccion(id) {
  document.querySelectorAll("div[id^='pantalla']").forEach(s => s.style.display = "none");
  document.getElementById(id).style.display = "block";
  if (id === "pantallaTareas") cargarTareas();
  if (id === "pantallaRealizadas") mostrarTareasGuardadas();
  if (id === "pantallaCamara") activarCamara();
}

// === TAREAS ===
function cargarTareas() {
  const selector = document.getElementById("selectorTareas");
  selector.innerHTML = '<option disabled selected>Selecciona una tarea</option>';
  tareas.forEach(t => {
    const op = document.createElement("option");
    op.value = t;
    op.textContent = t;
    selector.appendChild(op);
  });
}

function irACamara() {
  const t = document.getElementById("selectorTareas").value;
  if (!t) return alert("Selecciona una tarea");
  tareaSeleccionada = t;
  document.getElementById("tareaSeleccionadaTexto").textContent = "Tarea: " + tareaSeleccionada;
  mostrarSeccion("pantallaCamara");
}

// === CÁMARA ===
function activarCamara(facingMode = "user") {
  if (currentStream) {
    currentStream.getTracks().forEach(t => t.stop());
  }

  video = document.getElementById("video");
  canvas = document.getElementById("canvas");
  context = canvas.getContext("2d");

  navigator.mediaDevices.getUserMedia({ video: { facingMode } })
    .then(stream => {
      currentStream = stream;
      video.srcObject = stream;
    })
    .catch(err => alert("Error al acceder a la cámara: " + err));
}

function cambiarCamara(modo) {
  activarCamara(modo);
}

function tomarFoto() {
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  context.drawImage(video, 0, 0);
  const imgData = canvas.toDataURL("image/png");
  const fecha = new Date().toLocaleString();
  guardarTareaRealizada(tareaSeleccionada, imgData, fecha);
  puntos += 10;
  guardarEnPerfil("puntos", puntos);
  mostrarSeccion("pantallaRealizadas");
}

// === DATOS POR USUARIO ===
function getPerfil() {
  const datos = JSON.parse(localStorage.getItem("usuarios")) || {};
  return datos[usuarioActual] || { puntos: 0, tareas: [], tema: "verde" };
}

function guardarEnPerfil(campo, valor) {
  let datos = JSON.parse(localStorage.getItem("usuarios")) || {};
  if (!datos[usuarioActual]) datos[usuarioActual] = { puntos: 0, tareas: [], tema: "verde" };
  datos[usuarioActual][campo] = valor;
  localStorage.setItem("usuarios", JSON.stringify(datos));
}

function cargarDatosUsuario() {
  const perfil = getPerfil();
  puntos = perfil.puntos || 0;
  document.getElementById("usuarioActivo").textContent = usuarioActual;
  document.getElementById("puntosTotales").textContent = puntos;
  document.getElementById("selectorTema").value = perfil.tema || "verde";
  cambiarTema(perfil.tema || "verde");
  actualizarNivel();
}

function guardarTareaRealizada(tarea, imagen, fecha) {
  const nueva = { tarea, imagen, fecha };
  let datos = getPerfil();
  datos.tareas.push(nueva);
  guardarEnPerfil("tareas", datos.tareas);
  guardarEnPerfil("puntos", puntos);
  actualizarNivel();
  alert("📸 Tarea registrada con éxito.");
}

function mostrarTareasGuardadas() {
  const contenedor = document.getElementById("fotosGuardadas");
  contenedor.innerHTML = "";
  const perfil = getPerfil();
  perfil.tareas.forEach((item, index) => {
    const div = document.createElement("div");

    const titulo = document.createElement("p");
    titulo.textContent = `${item.tarea} - ${item.fecha}`;
    titulo.style.fontWeight = "bold";

    const img = document.createElement("img");
    img.src = item.imagen;

    const btnEliminar = document.createElement("button");
    btnEliminar.textContent = "🗑 Eliminar";
    btnEliminar.style.backgroundColor = "#d32f2f";
    btnEliminar.style.marginTop = "5px";
    btnEliminar.onclick = () => eliminarTarea(index);

    div.appendChild(titulo);
    div.appendChild(img);
    div.appendChild(btnEliminar);

    contenedor.appendChild(div);
  });
}

function eliminarTarea(indice) {
  let perfil = getPerfil();
  if (confirm("¿Estás seguro de eliminar esta tarea?")) {
    perfil.tareas.splice(indice, 1);
    guardarEnPerfil("tareas", perfil.tareas);
    mostrarTareasGuardadas();
  }
}

// === NIVEL E INSIGNIAS ===
function actualizarNivel() {
  const txt = document.getElementById("nivelUsuario");
  let nivel = "🌱 Principiante";
  if (puntos >= 50 && puntos < 150) nivel = "🌿 Intermedio";
  if (puntos >= 150) nivel = "🌳 Avanzado";
  txt.textContent = nivel;
  document.getElementById("puntosTotales").textContent = puntos;
}

// === EXPORTAR HISTORIAL ===
function descargarHistorial() {
  const perfil = getPerfil();
  let texto = `Usuario: ${usuarioActual}\nPuntos: ${puntos}\nNivel: ${document.getElementById("nivelUsuario").textContent}\n\nTareas realizadas:\n`;
  perfil.tareas.forEach((t, i) => {
    texto += `${i + 1}. ${t.tarea} - ${t.fecha}\n`;
  });

  const blob = new Blob([texto], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${usuarioActual}_eco_historial.txt`;
  a.click();
}

// === CARGA INICIAL ===
if (localStorage.getItem("usuarioActivo")) {
  usuarioActual = localStorage.getItem("usuarioActivo");
  cargarDatosUsuario();
  mostrarFraseAleatoria();
  mostrarSeccion("pantallaInicio");
}
function cargarTareas() {
  const selector = document.getElementById("selectorTareas");
  const img = document.getElementById("imagenTareaEjemplo");

  selector.innerHTML = '<option disabled selected>Selecciona una tarea</option>';

  tareas.forEach(t => {
    const op = document.createElement("option");
    op.value = t;
    op.textContent = t;
    selector.appendChild(op);
  });

  selector.onchange = () => {
    const seleccion = selector.value;
    const mapaImagenes = {
      "🌿 Regar las plantas": "🌿 Regar las plantas.jpg",
      "🔌 Apagar aparatos eléctricos": "🔌 Apagar aparatos eléctricos.jpg",
      "🧹 Limpiar pupitre": "🧹 Limpiar pupitre.jpg",
      "🚫 Evitar bolsas plásticas": "🚫 Evitar bolsas plásticas.jpg",
      "💧 Usar botella reutilizable": "💧 Usar botella reutilizable.jpg",
      "🍃 Separar residuos orgánicos": "🍃 Separar residuos orgánicos.jpg",
      "🧃 Separar residuos inorgánicos": "🧃 Separar residuos inorgánicos.jpg",
      "🌱 Cuidar áreas verdes": "🌱 Cuidar áreas verdes.jpg",
      "🌾 Hacer composta": "🌾 Hacer composta.jpg",
      "🎨 No rayar paredes": "🎨 No rayar paredes.jpg",
      "🚿 Cerrar el grifo mientras te lavas las manos": "🚿 Cerrar el grifo mientras te lavas las manos.jpg"
    };

    if (mapaImagenes[seleccion]) {
      img.src = mapaImagenes[seleccion];
      img.style.display = "block";
    } else {
      img.style.display = "none";
    }
  };
}
