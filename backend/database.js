
/* =====================================================
   PROYECTO: ANFIBIOS CLUB
   ARCHIVO: database.js
   DESCRIPCIÓN: Configuración de la base de datos
===================================================== */

const Database = require("better-sqlite3");
const path = require("path");
const fs = require("fs");

// Detectar si estamos en Render o en desarrollo local
const rutaBaseDatos = process.env.RENDER
  ? "/var/data/anfibios.db"
  : path.join(__dirname, "anfibios.db");

// Crear la carpeta si no existe
fs.mkdirSync(path.dirname(rutaBaseDatos), {
  recursive: true
});

// Conectar con SQLite
const db = new Database(rutaBaseDatos);

// Crear tabla de estudiantes
db.exec(`
    CREATE TABLE IF NOT EXISTS estudiantes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        fecha_nacimiento TEXT NOT NULL,
        celular TEXT NOT NULL,
        emergencia TEXT NOT NULL,
        nivel TEXT NOT NULL,
        fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP
    )
`);

// Evitar estudiantes duplicados
db.exec(`
    CREATE UNIQUE INDEX IF NOT EXISTS
    idx_estudiante_nombre_fecha
    ON estudiantes (LOWER(TRIM(nombre)), fecha_nacimiento)
`);

module.exports = db;

console.log("Base de datos conectada correctamente.");
