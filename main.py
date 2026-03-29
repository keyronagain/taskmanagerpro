import sqlite3
from datetime import datetime
from typing import List, Literal
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field

DB_NAME = "tareas.db"

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class CrearTarea(BaseModel):
    texto: str = Field(..., min_length=1, max_length=200)
    categoria: Literal["Trabajo", "Estudio", "Personal"]

class ActualizarEstado(BaseModel):
    estado: Literal["Pendiente", "En progreso", "Completado"]

class ToggleCompletada(BaseModel):
    completada: bool

class ReordenarTareas(BaseModel):
    estado: Literal["Pendiente", "En progreso", "Completado"]
    ids: List[int]

def get_conn():
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    return conn

def crear_db():
    conn = get_conn()
    cursor = conn.cursor()
    cursor.execute(
        """
        CREATE TABLE IF NOT EXISTS tareas(
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            texto TEXT NOT NULL,
            categoria TEXT NOT NULL,
            estado TEXT NOT NULL DEFAULT 'Pendiente',
            fecha TEXT NOT NULL,
            orden INTEGER NOT NULL DEFAULT 0
        )
        """
    )
    conn.commit()
    conn.close()

crear_db()

@app.get("/tareas")
def obtener_tareas():
    conn = get_conn()
    cursor = conn.cursor()
    cursor.execute(
        """
        SELECT id, texto, categoria, estado, fecha, orden
        FROM tareas
        ORDER BY
            CASE estado
                WHEN 'Pendiente' THEN 1
                WHEN 'En progreso' THEN 2
                WHEN 'Completado' THEN 3
            END,
            orden ASC, id ASC
        """
    )
    tareas = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return tareas

@app.post("/tareas")
def crear_tarea(tarea: CrearTarea):
    texto = tarea.texto.strip()
    if not texto:
        raise HTTPException(status_code=400, detail="El texto no puede ir vacío")
    conn = get_conn()
    cursor = conn.cursor()
    cursor.execute(
        "SELECT COALESCE(MAX(orden), -1) + 1 AS siguiente FROM tareas WHERE estado = 'Pendiente'"
    )
    siguiente_orden = cursor.fetchone()["siguiente"]
    fecha = datetime.now().strftime("%d/%m/%Y %H:%M")
    cursor.execute(
        """
        INSERT INTO tareas(texto, categoria, estado, fecha, orden)
        VALUES (?, ?, 'Pendiente', ?, ?)
        """,
        (texto, tarea.categoria, fecha, siguiente_orden),
    )
    conn.commit()
    tarea_id = cursor.lastrowid
    cursor.execute(
        """
        SELECT id, texto, categoria, estado, fecha, orden
        FROM tareas WHERE id = ?
        """,
        (tarea_id,),
    )
    nueva_tarea = dict(cursor.fetchone())
    conn.close()
    return nueva_tarea

@app.put("/tareas/{tarea_id}/estado")
def actualizar_estado(tarea_id: int, datos: ActualizarEstado):
    conn = get_conn()
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM tareas WHERE id = ?", (tarea_id,))
    tarea = cursor.fetchone()
    if not tarea:
        conn.close()
        raise HTTPException(status_code=404, detail="Tarea no encontrada")
    cursor.execute(
        "SELECT COALESCE(MAX(orden), -1) + 1 AS siguiente FROM tareas WHERE estado = ?",
        (datos.estado,),
    )
    siguiente_orden = cursor.fetchone()["siguiente"]
    cursor.execute(
        "UPDATE tareas SET estado = ?, orden = ? WHERE id = ?",
        (datos.estado, siguiente_orden, tarea_id),
    )
    conn.commit()
    conn.close()
    return {"ok": True}

@app.put("/tareas/{tarea_id}/completada")
def toggle_completada(tarea_id: int, datos: ToggleCompletada):
    conn = get_conn()
    cursor = conn.cursor()
    cursor.execute("SELECT id FROM tareas WHERE id = ?", (tarea_id,))
    tarea = cursor.fetchone()
    if not tarea:
        conn.close()
        raise HTTPException(status_code=404, detail="Tarea no encontrada")
    nuevo_estado = "Completado" if datos.completada else "Pendiente"
    cursor.execute(
        "SELECT COALESCE(MAX(orden), -1) + 1 AS siguiente FROM tareas WHERE estado = ?",
        (nuevo_estado,),
    )
    siguiente_orden = cursor.fetchone()["siguiente"]
    cursor.execute(
        "UPDATE tareas SET estado = ?, orden = ? WHERE id = ?",
        (nuevo_estado, siguiente_orden, tarea_id),
    )
    conn.commit()
    conn.close()
    return {"ok": True}

@app.put("/tareas/reordenar")
def reordenar_tareas(datos: ReordenarTareas):
    conn = get_conn()
    cursor = conn.cursor()
    for indice, tarea_id in enumerate(datos.ids):
        cursor.execute(
            "UPDATE tareas SET estado = ?, orden = ? WHERE id = ?",
            (datos.estado, indice, tarea_id),
        )
    conn.commit()
    conn.close()
    return {"ok": True}

@app.delete("/tareas/{tarea_id}")
def eliminar_tarea(tarea_id: int):
    conn = get_conn()
    cursor = conn.cursor()
    cursor.execute("DELETE FROM tareas WHERE id = ?", (tarea_id,))
    conn.commit()
    borradas = cursor.rowcount
    conn.close()
    if borradas == 0:
        raise HTTPException(status_code=404, detail="Tarea no encontrada")
    return {"ok": True}

# Servir frontend — va al final siempre
app.mount("/static", StaticFiles(directory="static"), name="static")

@app.get("/")
def serve_frontend():
    return FileResponse("static/index.html")