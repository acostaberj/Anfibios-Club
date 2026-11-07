// ANFIBIOS CLUB - SERVIDOR

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const db = require("./database");

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const SECRET = process.env.JWT_SECRET;

// Verificar configuración
if (
    !process.env.ADMIN_USER ||
    !process.env.ADMIN_PASSWORD ||
    !SECRET
) {
    throw new Error("Faltan datos de configuración en .env");
}

// RUTA PRINCIPAL
app.get("/", (req, res) => {
    res.send("Backend de Anfibios Club funcionando");
});

// INICIO DE SESIÓN ADMINISTRATIVO
app.post("/api/admin/login", (req, res) => {

    const { usuario, password } = req.body || {};

    if (
        usuario !== process.env.ADMIN_USER ||
        password !== process.env.ADMIN_PASSWORD
    ) {
        return res.status(401).json({
            mensaje: "Usuario o contraseña incorrectos"
        });
    }

    const token = jwt.sign(
        { usuario, rol: "admin" },
        SECRET,
        { expiresIn: "2h" }
    );

    res.json({
        mensaje: "Inicio de sesión exitoso",
        token
    });
});

// PROTEGER LAS RUTAS ADMINISTRATIVAS
function verificarAdmin(req, res, next) {

    const autorizacion = req.headers.authorization;

    if (!autorizacion) {
        return res.status(401).json({
            mensaje: "Debes iniciar sesión"
        });
    }

    const token = autorizacion.split(" ")[1];

    try {

        const datos = jwt.verify(token, SECRET);

        if (datos.rol !== "admin") {
            return res.status(403).json({
                mensaje: "Acceso denegado"
            });
        }

        next();

    } catch (error) {

        return res.status(401).json({
            mensaje: "Sesión inválida o vencida"
        });
    }
}

// REGISTRAR ESTUDIANTES
app.post("/api/estudiantes", (req, res) => {

    const {
        nombre,
        fechaNacimiento,
        celular,
        emergencia,
        nivel
    } = req.body || {};

    if (
        !nombre ||
        !fechaNacimiento ||
        !celular ||
        !emergencia ||
        !nivel
    ) {
        return res.status(400).json({
            mensaje: "Todos los campos son obligatorios"
        });
    }

    try {

        const existente = db.prepare(`
            SELECT id FROM estudiantes
            WHERE LOWER(TRIM(nombre)) = LOWER(TRIM(?))
            AND fecha_nacimiento = ?
        `).get(nombre, fechaNacimiento);

        if (existente) {
            return res.status(409).json({
                mensaje: "Este estudiante ya está registrado"
            });
        }

        const resultado = db.prepare(`
            INSERT INTO estudiantes
            (nombre, fecha_nacimiento, celular, emergencia, nivel)
            VALUES (?, ?, ?, ?, ?)
        `).run(
            nombre.trim(),
            fechaNacimiento,
            celular.trim(),
            emergencia.trim(),
            nivel.trim()
        );

        res.status(201).json({
            mensaje: "Inscripción guardada correctamente",
            id: resultado.lastInsertRowid
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            mensaje: "Error al registrar estudiante"
        });
    }
});

// CONSULTAR ESTUDIANTES
app.get("/api/estudiantes", verificarAdmin, (req, res) => {

    const estudiantes = db.prepare(`
        SELECT * FROM estudiantes
        ORDER BY id DESC
    `).all();

    res.json(estudiantes);
});

// EDITAR ESTUDIANTE
app.put("/api/estudiantes/:id", verificarAdmin, (req, res) => {

    const {
        nombre,
        fecha_nacimiento,
        celular,
        emergencia,
        nivel
    } = req.body || {};

    if (
        !nombre ||
        !fecha_nacimiento ||
        !celular ||
        !emergencia ||
        !nivel
    ) {
        return res.status(400).json({
            mensaje: "Completa todos los campos"
        });
    }

    const resultado = db.prepare(`
        UPDATE estudiantes
        SET nombre = ?,
            fecha_nacimiento = ?,
            celular = ?,
            emergencia = ?,
            nivel = ?
        WHERE id = ?
    `).run(
        nombre.trim(),
        fecha_nacimiento,
        celular.trim(),
        emergencia.trim(),
        nivel.trim(),
        req.params.id
    );

    if (resultado.changes === 0) {
        return res.status(404).json({
            mensaje: "Estudiante no encontrado"
        });
    }

    res.json({
        mensaje: "Estudiante actualizado correctamente"
    });
});

// ELIMINAR ESTUDIANTE
app.delete("/api/estudiantes/:id", verificarAdmin, (req, res) => {

    const resultado = db.prepare(`
        DELETE FROM estudiantes WHERE id = ?
    `).run(req.params.id);

    if (resultado.changes === 0) {
        return res.status(404).json({
            mensaje: "Estudiante no encontrado"
        });
    }

    res.json({
        mensaje: "Estudiante eliminado correctamente"
    });
});

// INICIAR SERVIDOR
app.listen(PORT, () => {
    console.log(
        `Anfibios Club funcionando en http://localhost:${PORT}`
    );
});