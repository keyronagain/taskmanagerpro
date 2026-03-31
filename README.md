# 📋 Task Manager Pro

An interactive Kanban board for managing daily tasks with real-time updates and drag & drop functionality.

Helps users organize their workflow by categorizing tasks and tracking progress visually across three stages: Pending, In Progress, and Completed.

Built as a full-stack portfolio project combining a REST API backend with a vanilla JavaScript frontend.

Live demo: **taskmanagerpro-omvf.onrender.com**

## Features

* Real-time updates — add, move, and delete tasks instantly
* Drag & drop — move tasks between columns with mouse
* Progress tracking — live progress bar showing completion percentage
* Category system — classify tasks as Work, Study, or Personal
* Search & filter — find tasks by text or category in real time
* Persistent storage — all tasks and order saved to database
* Responsive design — works on desktop and mobile

## How it works

Each task follows a simple state machine:
```
Pending → In Progress → Completed
```

The frontend communicates with the backend through a REST API. Every action (create, update, reorder, delete) sends a request to FastAPI, which processes it and updates the SQLite database. The UI re-renders automatically after each operation.

## Tech stack

* **Frontend:** HTML5, CSS3, Vanilla JavaScript
* **Backend:** Python, FastAPI
* **Database:** SQLite
* **Server:** Uvicorn
* **Deploy:** Render

## Project structure
```
taskmanagerpro/
├── main.py          # REST API and database logic
├── requirements.txt # Python dependencies
├── static/
│   ├── index.html   # Main HTML structure
│   ├── css/
│   │   └── styles.css  # All styles and responsive layout
│   └── js/
│       └── app.js   # Calculations, requests, and interactivity
└── README.md        # This file
```

## Author

Keyron Brenes — Computer Engineering student, Costa Rica
GitHub: **@keyronagain**
