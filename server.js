
/* =====================================================
   PROYECTO: ANFIBIOS CLUB
   ARCHIVO: server.js
   DESCRIPCIÓN: Servidor backend con Node.js y Express
===================================================== */


// 1. IMPORTAR EXPRESS Y CORS

const express = require("express");
const cors = require("cors");


// 2. CREAR LA APLICACIÓN

const app = express();


// 3. CONFIGURAR LOS MIDDLEWARE

app.use(cors());
app.use(express.json());


// 4. CONFIGURAR EL PUERTO

const PORT = 3000;


// 5. RUTA PRINCIPAL DEL SERVIDOR

app.get("/", function(req, res) {

    res.send("¡Bienvenido al backend de Anfibios Club!");

});


// 6. RUTA GET: CONSULTAR ESTUDIANTES

app.get("/api/estudiantes", function(req, res) {

    const estudiantes = [
        {
            nombre: "Andrés",
            nivel: "Básico"
        },
        {
            nombre: "Laura",
            nivel: "Intermedio"
        }
    ];

    res.json(estudiantes);

});


// 7. RUTA POST: RECIBIR UNA NUEVA INSCRIPCIÓN

app.post("/api/estudiantes", function(req, res) {

    const nuevoEstudiante = req.body;

    console.log("Nuevo estudiante:", nuevoEstudiante);

    res.json({
        mensaje: "Inscripción recibida correctamente",
        estudiante: nuevoEstudiante
    });

});


// 8. ENCENDER EL SERVIDOR

app.listen(PORT, function() {

    console.log(
        "Servidor funcionando en http://localhost:" + PORT
    );

});
