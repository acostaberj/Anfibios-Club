
const { Pool } = require("pg");

// ==========================================
// CONEXIÓN CON POSTGRESQL - NEON
// ==========================================

const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// ==========================================
// INICIALIZAR BASE DE DATOS
// ==========================================

async function inicializarBaseDatos() {

  // Crear tabla de estudiantes
  await db.query(`
    CREATE TABLE IF NOT EXISTS estudiantes (
      id SERIAL PRIMARY KEY,
      nombre TEXT NOT NULL,
      fecha_nacimiento TEXT NOT NULL,
      celular TEXT NOT NULL,
      emergencia TEXT NOT NULL,
      nivel TEXT NOT NULL,
      fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Evitar registros duplicados
  await db.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS
    idx_estudiante_nombre_fecha
    ON estudiantes (LOWER(TRIM(nombre)), fecha_nacimiento)
  `);

  // ==========================================
  // COMPROBAR CONEXIÓN
  // ==========================================

  const resultado = await db.query(`
    SELECT
      current_database() AS base_datos,
      current_user AS usuario,
      current_schema() AS esquema
  `);

  console.log("Base de datos PostgreSQL conectada correctamente.");

  console.log("Conexión utilizada:", resultado.rows[0]);

}

// ==========================================
// EXPORTAR CONEXIÓN Y FUNCIÓN
// ==========================================

module.exports = {
  db,
  inicializarBaseDatos
};
