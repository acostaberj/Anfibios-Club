
/* =====================================================
   PROYECTO: ANFIBIOS CLUB
   ARCHIVO: server.js
   DESCRIPCIÓN: Servidor backend con Node.js y Express
===================================================== */

// 1. IMPORTAR LAS LIBRERÍAS

const express = require("express");
const cors = require("cors");
const db = require("./database");


// 2. CREAR LA APLICACIÓN

const app = express();


// 3. CONFIGURAR LOS MIDDLEWARE

app.use(cors());
app.use(express.json());


// 4. CONFIGURAR EL PUERTO

const PORT = 3000;


// 5. RUTA PRINCIPAL

app.get("/", function(req, res) {

    res.send("¡Bienvenido al backend de Anfibios Club!");

});


// 6. RUTA POST: REGISTRAR ESTUDIANTES

app.post("/api/estudiantes", function(req, res) {

    // Obtener los datos enviados desde el formulario

    const {
        nombre,
        fechaNacimiento,
        celular,
        emergencia,
        nivel
    } = req.body || {};


    // 7. VALIDAR LOS DATOS

    if (
        typeof nombre !== "string" ||
        typeof fechaNacimiento !== "string" ||
        typeof celular !== "string" ||
        typeof emergencia !== "string" ||
        typeof nivel !== "string" ||
        !nombre.trim() ||
        !fechaNacimiento.trim() ||
        !celular.trim() ||
        !emergencia.trim() ||
        !nivel.trim()
    ) {

        return res.status(400).json({
            mensaje: "Todos los campos son obligatorios."
        });

    }


    try {

        // 8. COMPROBAR SI EL ESTUDIANTE YA EXISTE

        const estudianteExistente = db.prepare(`
            SELECT id
            FROM estudiantes
            WHERE LOWER(TRIM(nombre)) = LOWER(TRIM(?))
            AND fecha_nacimiento = ?
        `).get(nombre, fechaNacimiento);


        // 9. EVITAR REGISTROS DUPLICADOS

        if (estudianteExistente) {

            return res.status(409).json({
                mensaje: "Este estudiante ya está registrado."
            });

        }


        // 10. PREPARAR LA INSERCIÓN EN SQLITE

        const insertarEstudiante = db.prepare(`
            INSERT INTO estudiantes (
                nombre,
                fecha_nacimiento,
                celular,
                emergencia,
                nivel
            )
            VALUES (?, ?, ?, ?, ?)
        `);


        // 11. GUARDAR LOS DATOS

        const resultado = insertarEstudiante.run(
            nombre.trim(),
            fechaNacimiento,
            celular.trim(),
            emergencia.trim(),
            nivel.trim()
        );


        // 12. CONFIRMAR EL REGISTRO

        return res.status(201).json({

            mensaje: "Inscripción guardada correctamente.",

            id: resultado.lastInsertRowid

        });


    } catch (error) {

        // 13. CAPTURAR ERRORES DE DUPLICADOS

        if (error.code === "SQLITE_CONSTRAINT_UNIQUE") {

            return res.status(409).json({
                mensaje: "Este estudiante ya está registrado."
            });

        }


        // 14. CAPTURAR OTROS ERRORES

        console.error("Error al guardar estudiante:", error);

        return res.status(500).json({
            mensaje: "Ocurrió un error al guardar la inscripción."
        });

    }

});


// 15. INICIAR EL SERVIDOR

app.listen(PORT, function() {

    console.log(
        "Servidor funcionando en http://localhost:" + PORT
    );

});
