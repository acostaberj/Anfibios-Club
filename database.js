
/* =====================================================
   PROYECTO: ANFIBIOS CLUB
   ARCHIVO: database.js
   DESCRIPCIÓN: Configuración de la base de datos
===================================================== */

// 1. IMPORTAR LIBRERÍAS

const Database = require("better-sqlite3");
const path = require("path");

// 2. ESTABLECER LA UBICACIÓN DE LA BASE DE DATOS

const rutaBaseDatos = path.join(__dirname, "anfibios.db");

const db = new Database(rutaBaseDatos);

// 3. CREAR LA TABLA DE ESTUDIANTES

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

// 4. CREAR RESTRICCIÓN PARA EVITAR DUPLICADOS

db.exec(`
    CREATE UNIQUE INDEX IF NOT EXISTS
    idx_estudiante_nombre_fecha
    ON estudiantes (LOWER(TRIM(nombre)), fecha_nacimiento)
`);

// 5. EXPORTAR LA CONEXIÓN

module.exports = db;

console.log("Base de datos conectada correctamente.");
