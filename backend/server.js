
/* ==========================================
   ANFIBIOS CLUB
   Backend: Node.js + Express + PostgreSQL + Gemini
========================================== */

// ==========================================
// 1. IMPORTAR LIBRERIAS
// ==========================================

const path = require('path');

require('dotenv').config({
  path: path.join(__dirname, '.env')
});

const express = require('express');
const cors = require('cors');
const crypto = require('node:crypto');

const { db, inicializarBaseDatos } = require('./database');

const app = express();

// ==========================================
// 2. CONFIGURACION DEL SERVIDOR
// ==========================================

app.use(cors());
app.use(express.json({ limit: '20kb' }));

const PORT = process.env.PORT || 3000;

const USER = process.env.ADMIN_USER;
const PASSWORD = process.env.ADMIN_PASSWORD;
const SECRET = process.env.JWT_SECRET;

const geminiConfigurado = Boolean(
  process.env.GEMINI_API_KEY &&
  process.env.GEMINI_API_KEY.trim()
);

// ==========================================
// 3. VALIDAR DATOS DEL ESTUDIANTE
// ==========================================

function datosValidos(d) {
  return d &&
    typeof d.nombre === 'string' &&
    d.nombre.trim().length >= 2 &&
    d.nombre.length <= 100 &&
    typeof d.fechaNacimiento === 'string' &&
    /^\d{4}-\d{2}-\d{2}$/.test(d.fechaNacimiento) &&
    !Number.isNaN(Date.parse(d.fechaNacimiento)) &&
    d.fechaNacimiento <= new Date().toISOString().slice(0, 10) &&
    /^\d{10}$/.test(d.celular || '') &&
    /^\d{10}$/.test(d.emergencia || '') &&
    ['basico', 'intermedio', 'avanzado'].includes(d.nivel);
}

// ==========================================
// 4. RUTA DE PRUEBA
// ==========================================

app.get('/api/salud', (req, res) => {
  res.json({
    mensaje: 'Servidor funcionando'
  });
});

// ==========================================
// 5. REGISTRO DE ESTUDIANTES
// ==========================================

app.post('/api/estudiantes', async (req, res) => {
  console.log("SOLICITUD RECIBIDA EN EL BACKEND");
  const d = req.body;

  if (!datosValidos(d)) {
    return res.status(400).json({
      mensaje: 'Revisa los campos del formulario.'
    });
  }

  try {
    const resultado = await db.query(
      `INSERT INTO estudiantes
      (nombre, fecha_nacimiento, celular, emergencia, nivel)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id`,
      [
        d.nombre.trim(),
        d.fechaNacimiento,
        d.celular,
        d.emergencia,
        d.nivel
      ]
    );

    console.log(
      'ESTUDIANTE INSERTADO:',
      resultado.rows[0]
    );

    const comprobacion = await db.query(
      'SELECT * FROM estudiantes WHERE id = $1',
      [resultado.rows[0].id]
    );

    console.log(
      'REGISTRO VERIFICADO EN POSTGRESQL:',
      comprobacion.rows[0]
    );

    return res.status(201).json({
      mensaje: 'Inscripción guardada correctamente.',
      id: resultado.rows[0].id
    });

  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({
        mensaje: 'Este estudiante ya está registrado.'
      });
    }

    console.error('ERROR AL GUARDAR ESTUDIANTE:', error);

    return res.status(500).json({
      mensaje: 'No se pudo guardar la inscripción.'
    });
  }
});

// ==========================================
// 6. GENERAR TOKEN DEL ADMINISTRADOR
// ==========================================

function firmar(payload) {
  const contenido = Buffer
    .from(JSON.stringify(payload))
    .toString('base64url');

  const firma = crypto
    .createHmac('sha256', SECRET)
    .update(contenido)
    .digest('base64url');

  return contenido + '.' + firma;
}

// ==========================================
// 7. VALIDAR TOKEN
// ==========================================

function validarToken(req, res, next) {
  if (!SECRET) {
    return res.status(503).json({
      mensaje: 'Configura el servidor.'
    });
  }

  const token = (req.headers.authorization || '')
    .replace(/^Bearer /, '');

  const [contenido, firma] = token.split('.');

  if (!contenido || !firma) {
    return res.status(401).json({
      mensaje: 'Inicia sesión.'
    });
  }

  const esperada = crypto
    .createHmac('sha256', SECRET)
    .update(contenido)
    .digest();

  let recibida;

  try {
    recibida = Buffer.from(firma, 'base64url');
  } catch {
    return res.status(401).json({
      mensaje: 'Sesión inválida.'
    });
  }

  if (
    recibida.length !== esperada.length ||
    !crypto.timingSafeEqual(recibida, esperada)
  ) {
    return res.status(401).json({
      mensaje: 'Sesión inválida.'
    });
  }

  try {
    const sesion = JSON.parse(
      Buffer.from(contenido, 'base64url').toString()
    );

    if (
      sesion.usuario !== USER ||
      sesion.exp < Date.now()
    ) {
      throw new Error('Sesión caducada');
    }

    next();

  } catch {
    return res.status(401).json({
      mensaje: 'La sesión caducó. Inicia sesión otra vez.'
    });
  }
}

// ==========================================
// 8. INICIO DE SESION DEL ADMINISTRADOR
// ==========================================

app.post('/api/admin/login', (req, res) => {
  if (
    !USER ||
    !PASSWORD ||
    !SECRET ||
    SECRET.length < 32
  ) {
    return res.status(503).json({
      mensaje: 'Primero configura las variables del administrador.'
    });
  }

  const { usuario, clave } = req.body || {};

  const a = crypto
    .createHash('sha256')
    .update(String(usuario || '') + '\0' + String(clave || ''))
    .digest();

  const b = crypto
    .createHash('sha256')
    .update(USER + '\0' + PASSWORD)
    .digest();

  if (!crypto.timingSafeEqual(a, b)) {
    return res.status(401).json({
      mensaje: 'Usuario o contraseña incorrectos.'
    });
  }

  return res.json({
    token: firmar({
      usuario: USER,
      exp: Date.now() + 8 * 60 * 60 * 1000
    })
  });
});

// ==========================================
// 9. CONSULTAR ESTUDIANTES
// ==========================================

app.get('/api/admin/estudiantes', validarToken, async (req, res) => {
  try {
    const resultado = await db.query(
      'SELECT * FROM estudiantes ORDER BY id DESC'
    );

    res.json(resultado.rows);

  } catch (error) {
    console.error('Error al consultar estudiantes:', error);

    res.status(500).json({
      mensaje: 'No se pudieron consultar los estudiantes.'
    });
  }
});

// ==========================================
// 10. EDITAR ESTUDIANTES
// ==========================================

app.put('/api/admin/estudiantes/:id', validarToken, async (req, res) => {
  const d = {
    ...req.body,
    fechaNacimiento: req.body?.fechaNacimiento ||
      req.body?.fecha_nacimiento
  };

  if (!datosValidos(d)) {
    return res.status(400).json({
      mensaje: 'Revisa los datos del estudiante.'
    });
  }

  try {
    const resultado = await db.query(
      `UPDATE estudiantes
       SET nombre = $1,
           fecha_nacimiento = $2,
           celular = $3,
           emergencia = $4,
           nivel = $5
       WHERE id = $6
       RETURNING id`,
      [
        d.nombre.trim(),
        d.fechaNacimiento,
        d.celular,
        d.emergencia,
        d.nivel,
        req.params.id
      ]
    );

    if (resultado.rowCount === 0) {
      return res.status(404).json({
        mensaje: 'No existe ese estudiante.'
      });
    }

    res.json({
      mensaje: 'Estudiante actualizado.'
    });

  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({
        mensaje: 'Ya existe un estudiante con ese nombre y fecha.'
      });
    }

    console.error('Error al actualizar:', error);

    res.status(500).json({
      mensaje: 'No se pudo actualizar.'
    });
  }
});

// ==========================================
// 11. ELIMINAR ESTUDIANTES
// ==========================================

app.delete('/api/admin/estudiantes/:id', validarToken, async (req, res) => {
  try {
    const resultado = await db.query(
      'DELETE FROM estudiantes WHERE id = $1 RETURNING id',
      [req.params.id]
    );

    if (resultado.rowCount === 0) {
      return res.status(404).json({
        mensaje: 'No existe ese estudiante.'
      });
    }

    res.json({
      mensaje: 'Estudiante eliminado.'
    });

  } catch (error) {
    console.error('Error al eliminar estudiante:', error);

    res.status(500).json({
      mensaje: 'No se pudo eliminar el estudiante.'
    });
  }
});

// ==========================================
// 12. INFORMACION DE ANFIBIOS CLUB
// ==========================================

const informacionClub = `
INFORMACION OFICIAL DE ANFIBIOS CLUB:

QUIENES SOMOS:
Anfibios Club es una familia deportiva dedicada a enseñar natación
con empatía, amor y dedicación. Ofrece clases didácticas y actividades
recreativas. Busca que niños, jóvenes y adultos desarrollen confianza
en el agua, aprendan técnicas correctas, mejoren su resistencia
y disfruten de la natación.

MISION:
Transformar la relación de las personas con el agua mediante una
enseñanza basada en la empatía, el amor y la seguridad.
Guiamos a niños, jóvenes y adultos paso a paso, ayudándoles a superar
sus miedos y aprender natación a su propio ritmo.

VISION:
Ser un club de natación de referencia en la comunidad, reconocido
por la formación técnica de sus alumnos y por formar personas seguras,
independientes en el agua y apasionadas por el deporte.

INSTRUCTOR:
El instructor es Jose Acosta Bermudez.
Cuenta con más de un año de experiencia enseñando natación a personas
de diferentes edades.
Está certificado como instructor en la Universidad Nacional de
Colombia, sede Medellín.
Sus áreas de especialidad son la pérdida del miedo al agua,
la seguridad acuática y el perfeccionamiento técnico de los estilos.

METODO DE ENSEÑANZA:
Anfibios Club realiza un examen de diagnóstico para conocer el nivel
y las necesidades de cada estudiante.
La enseñanza se adapta al ritmo de aprendizaje de cada persona.
El proceso puede comenzar desde la familiarización con el agua
y la flotación, hasta el aprendizaje y perfeccionamiento de estilos.

LOS CUATRO ESTILOS DE NATACION:

1. CROL O LIBRE:
Utiliza brazadas alternas, patada de aleteo y respiración lateral.
Se caracteriza por ser el estilo más rápido.

2. ESPALDA:
Se realiza boca arriba, con movimiento alterno de brazos y patada
de aleteo. La cabeza permanece mirando hacia arriba.

3. PECHO O BRAZA:
Utiliza movimientos simultáneos y simétricos de brazos y piernas.
Incluye la conocida patada de rana.

4. MARIPOSA:
Combina una ondulación corporal, brazada simultánea y patada
de delfín. Requiere coordinación y ritmo.

BENEFICIOS DE LA NATACION:
- Favorece la seguridad y las habilidades acuáticas.
- Fortalece los músculos.
- Contribuye a mejorar la capacidad pulmonar.
- Es una actividad de bajo impacto para las articulaciones.
- Ayuda a desarrollar confianza y superar el miedo al agua.
- Permite avanzar progresivamente desde la flotación hasta
  el perfeccionamiento de los estilos.

PROCESO DE INSCRIPCION:
La página cuenta con un formulario de inscripción que solicita:
- Nombre completo.
- Fecha de nacimiento.
- Número de celular.
- Nivel de experiencia.
- Teléfono de emergencia.
- Aceptación de los términos.

Los niveles que aparecen en el formulario son:
básico, intermedio y avanzado.

INFORMACION QUE NO ESTA DEFINIDA:
La página no especifica precios, horarios, dirección exacta,
duración de los cursos ni disponibilidad de cupos.
No debes inventar estos datos.
Cuando una persona pregunte por ellos, recomienda comunicarse
directamente con Anfibios Club.
`;

// ==========================================
// 13. CHATBOT CON GEMINI
// ==========================================

app.post('/api/chat', async (req, res) => {
  const { mensaje } = req.body || {};

  if (!geminiConfigurado) {
    return res.status(503).json({
      mensaje: 'La inteligencia artificial no está configurada.'
    });
  }

  if (
    typeof mensaje !== 'string' ||
    !mensaje.trim() ||
    mensaje.length > 1000
  ) {
    return res.status(400).json({
      mensaje: 'Escribe una pregunta válida de máximo 1000 caracteres.'
    });
  }

  try {
    const { GoogleGenAI } = await import('@google/genai');

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY
    });

    const respuesta = await ai.models.generateContent({
      model: 'gemini-3.6-flash',

      contents: `
        Eres el asistente virtual oficial de Anfibios Club.

        Tu función es orientar a los visitantes de la escuela
        y responder sus preguntas de manera amable, clara,
        natural y en español.

        UTILIZA SOLAMENTE LA SIGUIENTE INFORMACION
        PARA RESPONDER PREGUNTAS SOBRE ANFIBIOS CLUB:

        ${informacionClub}

        REGLAS PARA RESPONDER:

        1. Saluda cordialmente y utiliza un lenguaje sencillo.
        2. Responde de forma breve y fácil de entender.
        3. Puedes explicar los cursos, los niveles, los estilos,
           los beneficios y el proceso de inscripción.
        4. Si preguntan por el instructor, utiliza únicamente
           la información proporcionada.
        5. No inventes precios, horarios, direcciones,
           teléfonos, fechas ni duración de cursos.
        6. Si no conoces una respuesta, reconoce que no tienes
           esa información y recomienda contactar con el club.
        7. No solicites contraseñas, datos bancarios ni información
           personal innecesaria.
        8. No confirmes que una persona está inscrita.
        9. Recuerda que eres un asistente informativo y no
           reemplazas la supervisión de un instructor.
        10. En cuestiones de seguridad acuática, recuerda que
            las clases no sustituyen la supervisión de un adulto
            responsable ni las medidas de seguridad.

        PREGUNTA DEL VISITANTE:

        ${mensaje.trim()}
      `
    });

    const textoRespuesta = respuesta.text;

    if (!textoRespuesta) {
      return res.status(502).json({
        mensaje: 'El asistente no pudo generar una respuesta.'
      });
    }

    res.json({
      respuesta: textoRespuesta
    });

  } catch (error) {
    console.error(
      'Error al consultar Gemini:',
      error.message
    );

    res.status(500).json({
      mensaje: 'No fue posible obtener una respuesta. Inténtalo nuevamente.'
    });
  }
});

// ==========================================
// 14. INICIAR SERVIDOR
// ==========================================

async function iniciarServidor() {
  try {
    await inicializarBaseDatos();
   
    app.listen(PORT, '0.0.0.0', () => {
      console.log('API disponible en el puerto ' + PORT);
      console.log(
        'Inteligencia artificial configurada:',
        geminiConfigurado
      );
    });

  } catch (error) {
    console.error('No se pudo iniciar el servidor:', error);
    process.exit(1);
  }
}

iniciarServidor();
