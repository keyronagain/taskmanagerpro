import sqlite3

conn = sqlite3.connect("tareas.db", check_same_thread=False)
cursor = conn.cursor()

cursor.execute("""
CREATE TABLE IF NOT EXISTS tareas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    texto TEXT
)
""")

conn.commit()