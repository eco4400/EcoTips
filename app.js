const tareas = [
  "🌿 Regar las plantas",
  "🗑 Organizar la basura en el bote correcto",
  "🔌 Apagar electrodomésticos",
  "🧹 Limpiar tu pupitre",
  "🚫 Evitar bolsas de plástico",
  "💧 Usar botellas reutilizables",
  "🍃 Separar residuos orgánicos",
  "🧃 Separar residuos inorgánicos",
  "🌱 Cuidar áreas verdes",
  "🌾 Crear composta",
  "🎨 No rayar las paredes"
];

let tareaSeleccionada = "";
let video = null, canvas = null, context = null;
let currentStream;

function cargarTareas() {
  const selector = document.getElementById("selectorTareas");
  selector.innerHTML = '<option disabled selected>Selecciona una tarea</option>';
  tareas.forEach(t => {
    const option = document.createElement("option");
    option.value = t;
    option.textContent = t;
    selector.appendChild(option);
  });
}

function mostrarSeccion(id) {
  const secciones = document.querySelectorAll("div[id^='pantalla']");
  secciones.forEach(s => s.style.display = "none");
  document.getElementById(id).style.display = "block";

  if (id === 'pantallaTareas') cargarTareas();
  if (id === 'pantallaCamara') activarCamara();
  if (id === 'pantallaRealizadas') mostrarTareasGuardadas();
}

function irACamara() {
  const selector = document.getElementById("selectorTareas");
  const seleccion = selector.value;

  if (!seleccion || seleccion === "Selecciona una tarea") {
    alert("Selecciona una tarea antes de continuar");
    return;
  }

  tareaSeleccionada = seleccion;
  document.getElementById("tareaSeleccionadaTexto").textContent = "Tarea: " + tareaSeleccionada;
  mostrarSeccion('pantallaCamara');
}

function activarCamara(facingMode = "user") {
  if (currentStream) {
    currentStream.getTracks().forEach(track => track.stop());
  }

  video = document.getElementById("video");
  canvas = document.getElementById("canvas");
  context = canvas.getContext("2d");

  navigator.mediaDevices.getUserMedia({ video: { facingMode } })
    .then(stream => {
      currentStream = stream;
      video.srcObject = stream;
    })
    .catch(err => alert("No se puede acceder a la cámara: " + err));
}

function cambiarCamara(modo) {
  activarCamara(modo);
}

function tomarFoto() {
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  context.drawImage(video, 0, 0);
  const imgData = canvas.toDataURL("image/png");

  guardarTareaRealizada(tareaSeleccionada, imgData);
  alert("📸 Tarea registrada con evidencia.");
  mostrarSeccion("pantallaRealizadas");
}

function guardarTareaRealizada(tarea, imagen) {
  const tareasGuardadas = JSON.parse(localStorage.getItem("tareasRealizadas")) || [];
  tareasGuardadas.push({ tarea, imagen });
  localStorage.setItem("tareasRealizadas", JSON.stringify(tareasGuardadas));
}

function mostrarTareasGuardadas() {
  const contenedor = document.getElementById("fotosGuardadas");
  contenedor.innerHTML = "";
  const tareasGuardadas = JSON.parse(localStorage.getItem("tareasRealizadas")) || [];

  tareasGuardadas.forEach(item => {
    const div = document.createElement("div");
    div.style.marginBottom = "20px";

    const titulo = document.createElement("p");
    titulo.textContent = item.tarea;
    titulo.style.fontWeight = "bold";

    const img = document.createElement("img");
    img.src = item.imagen;

    div.appendChild(titulo);
    div.appendChild(img);
    contenedor.appendChild(div);
  });
}

mostrarSeccion("pantallaInicio");
