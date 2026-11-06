
/* =====================================================
   PROYECTO: ANFIBIOS CLUB
   ARCHIVO: server.js
   DESCRIPCIÓN: Backend, inscripciones y administración
===================================================== */


// 1. IMPORTAR LAS LIBRERÍAS

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("./database");


// 2. CREAR LA APLICACIÓN

const app = express();


// 3. CONFIGURAR LOS MIDDLEWARE

app.use(cors());
app.use(express.json());


// 4. CONFIGURAR EL PUERTO

const PORT = 3000;


// 5. CREAR EL ADMINISTRADOR INICIAL

function crearAdministradorInicial() {

    const usuario = process.env.ADMIN_USER;
    const contraseña = process.env.ADMIN_PASSWORD;

    if (!usuario || !contraseña) {
        throw new Error(
            "Faltan las credenciales del administrador en .env"
        );
    }

    const administradorExistente = db.prepare(`
        SELECT id
        FROM administradores
        WHERE usuario = ?
    `).get(usuario);

    if (!administradorExistente) {

        const passwordHash = bcrypt.hashSync(contraseña, 12);

        db.prepare(`
            INSERT INTO administradores (
                usuario,
                password_hash
            )
            VALUES (?, ?)
        `).run(usuario, passwordHash);

        console.log("Administrador inicial creado correctamente.");

    } else {

        console.log("El administrador ya existe.");

    }
}

crearAdministradorInicial();


// 6. MIDDLEWARE DE AUTENTICACIÓN

function verificarToken(req, res, next) {

    const encabezado = req.headers["authorization"];

    if (!encabezado) {
        return res.status(401).json({
            mensaje: "Acceso denegado. Debes iniciar sesión."
        });
    }

    const partes = encabezado.split(" ");

    if (partes.length !== 2 || partes[0] !== "Bearer") {
        return res.status(401).json({
            mensaje: "Formato de autenticación inválido."
        });
    }

    const token = partes[1];

    try {

        if (!process.env.JWT_SECRET) {
            throw new Error("Falta configurar JWT_SECRET.");
        }

        const datosAdministrador = jwt.verify(
            token,
            process.env.JWT_SECRET
        );

        req.administrador = datosAdministrador;

        next();

    } catch (error) {

        return res.status(401).json({
            mensaje: "Sesión inválida o vencida. Inicia sesión nuevamente."
        });

    }
}


// 7. RUTA PRINCIPAL

app.get("/", function(req, res) {

    res.send("¡Bienvenido al backend de Anfibios Club!");

});


// 8. REGISTRAR ESTUDIANTES

app.post("/api/estudiantes", function(req, res) {

    const {
        nombre,
        fechaNacimiento,
        celular,
        emergencia,
        nivel
    } = req.body || {};

    // VALIDAR LOS DATOS

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

        // COMPROBAR SI EL ESTUDIANTE YA EXISTE

        const estudianteExistente = db.prepare(`
            SELECT id
            FROM estudiantes
            WHERE LOWER(TRIM(nombre)) = LOWER(TRIM(?))
            AND fecha_nacimiento = ?
        `).get(nombre, fechaNacimiento);

        if (estudianteExistente) {

            return res.status(409).json({
                mensaje: "Este estudiante ya está registrado."
            });

        }

        // INSERTAR EL ESTUDIANTE

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

        const resultado = insertarEstudiante.run(
            nombre.trim(),
            fechaNacimiento,
            celular.trim(),
            emergencia.trim(),
            nivel.trim()
        );

        return res.status(201).json({
            mensaje: "Inscripción guardada correctamente.",
            id: resultado.lastInsertRowid
        });

    } catch (error) {

        if (error.code === "SQLITE_CONSTRAINT_UNIQUE") {
            return res.status(409).json({
                mensaje: "Este estudiante ya está registrado."
            });
        }

        console.error("Error al guardar estudiante:", error);

        return res.status(500).json({
            mensaje: "Ocurrió un error al guardar la inscripción."
        });

    }

});


// 9. INICIO DE SESIÓN DEL ADMINISTRADOR

app.post("/api/admin/login", async function(req, res) {

    const { usuario, contraseña } = req.body || {};

    // VALIDAR LOS DATOS

    if (
        typeof usuario !== "string" ||
        typeof contraseña !== "string" ||
        !usuario.trim() ||
        !contraseña
    ) {

        return res.status(400).json({
            mensaje: "Ingresa tu usuario y contraseña."
        });

    }

    try {

        // BUSCAR EL ADMINISTRADOR

        const administrador = db.prepare(`
            SELECT id, usuario, password_hash
            FROM administradores
            WHERE usuario = ?
        `).get(usuario.trim());

        if (!administrador) {

            return res.status(401).json({
                mensaje: "Usuario o contraseña incorrectos."
            });

        }

        // COMPARAR LA CONTRASEÑA

        const contraseñaCorrecta = await bcrypt.compare(
            contraseña,
            administrador.password_hash
        );

        if (!contraseñaCorrecta) {

            return res.status(401).json({
                mensaje: "Usuario o contraseña incorrectos."
            });

        }

        // VERIFICAR LA CLAVE PRIVADA

        if (!process.env.JWT_SECRET) {
            throw new Error("Falta configurar JWT_SECRET.");
        }

        // GENERAR TOKEN JWT

        const token = jwt.sign(
            {
                id: administrador.id,
                usuario: administrador.usuario
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1h"
            }
        );

        return res.status(200).json({
            mensaje: "Inicio de sesión exitoso.",
            token: token,
            usuario: administrador.usuario
        });

    } catch (error) {

        console.error("Error en inicio de sesión:", error);

        return res.status(500).json({
            mensaje: "No fue posible iniciar sesión."
        });

    }

});


// 10. CONSULTAR ESTUDIANTES - RUTA PRIVADA

app.get(
    "/api/admin/estudiantes",
    verificarToken,
    function(req, res) {

        try {

            const estudiantes = db.prepare(`
                SELECT
                    id,
                    nombre,
                    fecha_nacimiento,
                    celular,
                    emergencia,
                    nivel,
                    fecha_registro
                FROM estudiantes
                ORDER BY fecha_registro DESC
            `).all();

            return res.status(200).json({
                mensaje: "Estudiantes consultados correctamente.",
                estudiantes: estudiantes
            });

        } catch (error) {

            console.error(
                "Error al consultar estudiantes:",
                error
            );

            return res.status(500).json({
                mensaje: "No fue posible consultar los estudiantes."
            });

        }

    }
);


// 11. EDITAR ESTUDIANTES - RUTA PRIVADA

app.put(
    "/api/admin/estudiantes/:id",
    verificarToken,
    function(req, res) {

        const id = Number(req.params.id);

        const {
            nombre,
            fechaNacimiento,
            celular,
            emergencia,
            nivel
        } = req.body || {};

        // VALIDAR IDENTIFICADOR

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                mensaje: "Identificador de estudiante inválido."
            });
        }

        // VALIDAR DATOS

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

            // COMPROBAR SI EXISTE EL ESTUDIANTE

            const estudiante = db.prepare(`
                SELECT id
                FROM estudiantes
                WHERE id = ?
            `).get(id);

            if (!estudiante) {
                return res.status(404).json({
                    mensaje: "Estudiante no encontrado."
                });
            }

            // ACTUALIZAR LOS DATOS

            db.prepare(`
                UPDATE estudiantes
                SET
                    nombre = ?,
                    fecha_nacimiento = ?,
                    celular = ?,
                    emergencia = ?,
                    nivel = ?
                WHERE id = ?
            `).run(
                nombre.trim(),
                fechaNacimiento,
                celular.trim(),
                emergencia.trim(),
                nivel.trim(),
                id
            );

            return res.status(200).json({
                mensaje: "Estudiante actualizado correctamente."
            });

        } catch (error) {

            if (error.code === "SQLITE_CONSTRAINT_UNIQUE") {
                return res.status(409).json({
                    mensaje: "Ya existe un estudiante con ese nombre y fecha de nacimiento."
                });
            }

            console.error("Error al editar estudiante:", error);

            return res.status(500).json({
                mensaje: "No fue posible actualizar el estudiante."
            });

        }

    }
);


// 12. ELIMINAR ESTUDIANTES - RUTA PRIVADA

app.delete(
    "/api/admin/estudiantes/:id",
    verificarToken,
    function(req, res) {

        const id = Number(req.params.id);

        // VALIDAR IDENTIFICADOR

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                mensaje: "Identificador de estudiante inválido."
            });
        }

        try {

            // ELIMINAR EL ESTUDIANTE

            const resultado = db.prepare(`
                DELETE FROM estudiantes
                WHERE id = ?
            `).run(id);

            if (resultado.changes === 0) {
                return res.status(404).json({
                    mensaje: "Estudiante no encontrado."
                });
            }

            return res.status(200).json({
                mensaje: "Estudiante eliminado correctamente."
            });

        } catch (error) {

            console.error("Error al eliminar estudiante:", error);

            return res.status(500).json({
                mensaje: "No fue posible eliminar el estudiante."
            });

        }

    }
);


// 13. INICIAR EL SERVIDOR

app.listen(PORT, function() {

    console.log(
        "Servidor funcionando en http://localhost:" + PORT
    );

});
