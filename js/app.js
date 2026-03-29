const API_URL = "http://127.0.0.1:8000";

let tareasGlobal = [];
let draggedTaskId = null;

const tareaInput       = document.getElementById("tareaInput");
const categoriaSelect  = document.getElementById("categoria");
const agregarBtn       = document.getElementById("agregarBtn");
const buscarInput      = document.getElementById("buscarInput");
const filtroCategoria  = document.getElementById("filtroCategoria");
const pendienteContainer  = document.getElementById("pendiente");
const progresoContainer   = document.getElementById("progreso");
const completadoContainer = document.getElementById("completado");
const progressBar      = document.getElementById("progressBar");
const contadorTexto    = document.getElementById("contadorTexto");
const porcentajeTexto  = document.getElementById("porcentajeTexto");
const countPendiente   = document.getElementById("countPendiente");
const countProgreso    = document.getElementById("countProgreso");
const countCompletado  = document.getElementById("countCompletado");

agregarBtn.addEventListener("click", agregarTarea);
tareaInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") agregarTarea();
});
buscarInput.addEventListener("input", renderizarTareas);
filtroCategoria.addEventListener("change", renderizarTareas);

document.querySelectorAll(".column").forEach((column) => {
  column.addEventListener("dragover", onDragOverColumn);
  column.addEventListener("dragleave", onDragLeaveColumn);
  column.addEventListener("drop", onDropColumn);
});

// ─── Carga inicial ───────────────────────────────────────────

async function cargarTareas() {
  try {
    const response = await fetch(`${API_URL}/tareas`);
    tareasGlobal = await response.json();
    renderizarTareas();
  } catch (error) {
    console.error("Error cargando tareas:", error);
  }
}

// ─── Filtros ─────────────────────────────────────────────────

function getTareasFiltradas() {
  const textoBusqueda  = buscarInput.value.trim().toLowerCase();
  const categoriaFiltro = filtroCategoria.value;

  return tareasGlobal.filter((tarea) => {
    const coincideTexto     = tarea.texto.toLowerCase().includes(textoBusqueda);
    const coincideCategoria = categoriaFiltro === "Todas" || tarea.categoria === categoriaFiltro;
    return coincideTexto && coincideCategoria;
  });
}

// ─── Render ──────────────────────────────────────────────────

function renderizarTareas() {
  const tareas = getTareasFiltradas();

  pendienteContainer.innerHTML  = "";
  progresoContainer.innerHTML   = "";
  completadoContainer.innerHTML = "";

  const pendientes  = tareas.filter((t) => t.estado === "Pendiente");
  const enProgreso  = tareas.filter((t) => t.estado === "En progreso");
  const completadas = tareas.filter((t) => t.estado === "Completado");

  renderizarLista(pendienteContainer,  pendientes);
  renderizarLista(progresoContainer,   enProgreso);
  renderizarLista(completadoContainer, completadas);

  countPendiente.textContent  = pendientes.length;
  countProgreso.textContent   = enProgreso.length;
  countCompletado.textContent = completadas.length;

  actualizarProgreso(pendientes.length, enProgreso.length, completadas.length);
}

function renderizarLista(container, tareas) {
  if (tareas.length === 0) {
    const empty = document.createElement("div");
    empty.className   = "empty-state";
    empty.textContent = "No hay tareas aquí";
    container.appendChild(empty);
    return;
  }

  tareas
    .sort((a, b) => a.orden - b.orden)
    .forEach((tarea) => {
      const task = document.createElement("div");
      task.className  = "task";
      task.draggable  = true;
      task.dataset.id = tarea.id;
      task.dataset.estado = tarea.estado;

      task.addEventListener("dragstart", onDragStartTask);
      task.addEventListener("dragend",   onDragEndTask);

      const isCompleted = tarea.estado === "Completado";

      task.innerHTML = `
        <div class="task-top">
          <div class="task-main">
            <input type="checkbox" class="complete-check" ${isCompleted ? "checked" : ""} />
            <div class="task-title-wrap">
              <div class="task-title ${isCompleted ? "completed" : ""}">
                ${escapeHtml(tarea.texto)}
              </div>
            </div>
          </div>
          <div class="task-actions">
            <button class="delete-btn" title="Eliminar">✕</button>
          </div>
        </div>
        <div class="task-bottom">
          <div class="meta-group">
            <span class="badge ${tarea.categoria.toLowerCase()}">
              ${escapeHtml(tarea.categoria)}
            </span>
            <span class="estado-badge">${escapeHtml(tarea.estado)}</span>
          </div>
          <span class="fecha">${escapeHtml(tarea.fecha)}</span>
        </div>
      `;

      task.querySelector(".complete-check").addEventListener("click", async (e) => {
        e.stopPropagation();
        await marcarCompletada(tarea.id, e.target.checked);
      });

      task.querySelector(".delete-btn").addEventListener("click", async (e) => {
        e.stopPropagation();
        await eliminarTarea(tarea.id);
      });

      container.appendChild(task);
    });
}

function actualizarProgreso(pendientes, enProgreso, completadas) {
  const total      = pendientes + enProgreso + completadas;
  const porcentaje = total > 0 ? Math.round((completadas / total) * 100) : 0;

  progressBar.style.width     = `${porcentaje}%`;
  porcentajeTexto.textContent = `${porcentaje}%`;
  contadorTexto.textContent   = `Pendientes: ${pendientes} | En progreso: ${enProgreso} | Completadas: ${completadas}`;
}

// ─── Acciones ────────────────────────────────────────────────

async function agregarTarea() {
  const texto     = tareaInput.value.trim();
  const categoria = categoriaSelect.value;

  if (!texto) {
    alert("Escribe una tarea");
    tareaInput.focus();
    return;
  }

  try {
    const response = await fetch(`${API_URL}/tareas`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ texto, categoria }),
    });

    if (!response.ok) throw new Error("No se pudo crear la tarea");

    tareaInput.value = "";
    tareaInput.focus();
    await cargarTareas();
  } catch (error) {
    console.error("Error agregando tarea:", error);
    alert("No se pudo agregar la tarea");
  }
}

async function eliminarTarea(id) {
  try {
    const response = await fetch(`${API_URL}/tareas/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) throw new Error("No se pudo eliminar");
    await cargarTareas();
  } catch (error) {
    console.error("Error eliminando tarea:", error);
    alert("No se pudo eliminar la tarea");
  }
}

async function marcarCompletada(id, completada) {
  try {
    const response = await fetch(`${API_URL}/tareas/${id}/completada`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completada }),
    });

    if (!response.ok) throw new Error("No se pudo actualizar");
    await cargarTareas();
  } catch (error) {
    console.error("Error marcando completada:", error);
    alert("No se pudo actualizar la tarea");
  }
}

// ─── Drag & Drop ─────────────────────────────────────────────

function onDragStartTask(e) {
  draggedTaskId = Number(e.currentTarget.dataset.id);
  e.currentTarget.classList.add("dragging");
}

function onDragEndTask(e) {
  e.currentTarget.classList.remove("dragging");
  draggedTaskId = null;
  document.querySelectorAll(".column").forEach((col) => {
    col.classList.remove("drop-hover");
  });
}

function onDragOverColumn(e) {
  e.preventDefault();
  e.currentTarget.classList.add("drop-hover");
}

function onDragLeaveColumn(e) {
  e.currentTarget.classList.remove("drop-hover");
}

async function onDropColumn(e) {
  e.preventDefault();
  e.currentTarget.classList.remove("drop-hover");

  if (!draggedTaskId) return;

  const nuevoEstado = e.currentTarget.dataset.estado;
  const container   = e.currentTarget.querySelector(".lista");
  const taskElement = document.querySelector(`.task[data-id="${draggedTaskId}"]`);

  if (!taskElement) return;

  container.appendChild(taskElement);
  await guardarNuevoOrdenDeColumna(container, nuevoEstado);
  await cargarTareas();
}

async function guardarNuevoOrdenDeColumna(container, estado) {
  const ids = [...container.querySelectorAll(".task")]
    .map((task) => Number(task.dataset.id));

  try {
    const response = await fetch(`${API_URL}/tareas/reordenar`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estado, ids }),
    });

    if (!response.ok) throw new Error("No se pudo guardar el orden");
  } catch (error) {
    console.error("Error guardando orden:", error);
    alert("No se pudo guardar el nuevo orden");
  }
}

// ─── Utilidades ──────────────────────────────────────────────

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// ─── Init ────────────────────────────────────────────────────

cargarTareas();
