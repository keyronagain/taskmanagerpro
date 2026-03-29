# Task Manager Pro 📋

App de gestión de tareas con tablero Kanban, construida con FastAPI y SQLite en el backend y HTML, CSS y JavaScript puro en el frontend.

## Vista previa

> Tablero con tres columnas: Pendiente, En progreso y Completado. Drag & drop entre columnas, barra de progreso, búsqueda y filtro por categorías.

## Tecnologías

- **Frontend:** HTML5, CSS3, JavaScript (vanilla)
- **Backend:** Python 3 + FastAPI
- **Base de datos:** SQLite
- **Servidor:** Uvicorn

## Funcionalidades

- ✅ Agregar tareas con categoría (Trabajo, Estudio, Personal)
- 📦 Tablero Kanban con 3 columnas (Pendiente, En progreso, Completado)
- 🖱️ Drag & drop entre columnas
- 💾 Orden persistente en base de datos
- ☑️ Marcar tareas como completadas con checkbox
- 🗑️ Eliminar tareas
- 🔍 Búsqueda en tiempo real
- 🏷️ Filtro por categoría
- 📊 Barra de progreso con porcentaje
- ⌨️ Agregar tareas con la tecla Enter

## Estructura del proyecto
```
task-manager-pro/
├── main.py          # Backend con FastAPI
├── index.html       # Interfaz principal
├── css/
│   └── styles.css   # Estilos
└── js/
    └── app.js       # Lógica del frontend
```

## Instalación y uso

### 1. Clonar el repositorio
```bash
git clone https://github.com/keyronagain/taskmanagerpro.git
cd taskmanagerpro
```

### 2. Crear entorno virtual e instalar dependencias
```bash
python -m venv venv

# Windows
venv\Scripts\activate

# Mac/Linux
source venv/bin/activate

pip install fastapi uvicorn
```

### 3. Encender el servidor
```bash
uvicorn main:app --reload
```

### 4. Abrir la app

Abre el archivo `index.html` directamente en tu navegador.

### 5. Documentación de la API

Con el servidor corriendo, entra a:
```
http://127.0.0.1:8000/docs
```

## Endpoints de la API

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/tareas` | Obtener todas las tareas |
| POST | `/tareas` | Crear una nueva tarea |
| PUT | `/tareas/{id}/estado` | Cambiar estado de una tarea |
| PUT | `/tareas/{id}/completada` | Marcar como completada |
| PUT | `/tareas/reordenar` | Guardar nuevo orden |
| DELETE | `/tareas/{id}` | Eliminar una tarea |

## Autor

**Keyron Brenes** — [@keyronagain](https://github.com/keyronagain)
