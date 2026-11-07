// Backend: API para inscripciones y administración.
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const crypto = require('node:crypto');
const db = require('./database');
const app = express();
app.use(cors());
app.use(express.json({ limit: '20kb' }));
const PORT = process.env.PORT || 3000;
const USER = process.env.ADMIN_USER;
const PASSWORD = process.env.ADMIN_PASSWORD;
const SECRET = process.env.JWT_SECRET;

function datosValidos(d) {
  return d && typeof d.nombre === 'string' && d.nombre.trim().length >= 2 && d.nombre.length <= 100 &&
    typeof d.fechaNacimiento === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d.fechaNacimiento) &&
    !Number.isNaN(Date.parse(d.fechaNacimiento)) && d.fechaNacimiento <= new Date().toISOString().slice(0,10) &&
    /^\d{10}$/.test(d.celular || '') && /^\d{10}$/.test(d.emergencia || '') &&
    ['basico', 'intermedio', 'avanzado'].includes(d.nivel);
}

app.get('/api/salud', (req, res) => res.json({ mensaje: 'Servidor funcionando' }));
app.post('/api/estudiantes', (req, res) => {
  const d = req.body;
  if (!datosValidos(d)) return res.status(400).json({ mensaje: 'Revisa los campos del formulario.' });
  try {
    const resultado = db.prepare('INSERT INTO estudiantes (nombre, fecha_nacimiento, celular, emergencia, nivel) VALUES (?, ?, ?, ?, ?)')
      .run(d.nombre.trim(), d.fechaNacimiento, d.celular, d.emergencia, d.nivel);
    return res.status(201).json({ mensaje: 'Inscripción guardada correctamente.', id: resultado.lastInsertRowid });
  } catch (error) {
    if (error.code?.startsWith('SQLITE_CONSTRAINT')) return res.status(409).json({ mensaje: 'Este estudiante ya está registrado.' });
    console.error(error);
    return res.status(500).json({ mensaje: 'No se pudo guardar la inscripción.' });
  }
});

function firmar(payload) {
  const contenido = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const firma = crypto.createHmac('sha256', SECRET).update(contenido).digest('base64url');
  return contenido + '.' + firma;
}
function validarToken(req, res, next) {
  if (!SECRET) return res.status(503).json({ mensaje: 'Configura el servidor.' });
  const token = (req.headers.authorization || '').replace(/^Bearer /, '');
  const [contenido, firma] = token.split('.');
  if (!contenido || !firma) return res.status(401).json({ mensaje: 'Inicia sesión.' });
  const esperada = crypto.createHmac('sha256', SECRET).update(contenido).digest();
  let recibida;
  try { recibida = Buffer.from(firma, 'base64url'); } catch { return res.status(401).json({ mensaje: 'Sesión inválida.' }); }
  if (recibida.length !== esperada.length || !crypto.timingSafeEqual(recibida, esperada)) return res.status(401).json({ mensaje: 'Sesión inválida.' });
  try {
    const sesion = JSON.parse(Buffer.from(contenido, 'base64url').toString());
    if (sesion.usuario !== USER || sesion.exp < Date.now()) throw new Error('Caducó');
    next();
  } catch { res.status(401).json({ mensaje: 'La sesión caducó. Inicia sesión otra vez.' }); }
}
app.post('/api/admin/login', (req, res) => {
  if (!USER || !PASSWORD || !SECRET || SECRET.length < 32) return res.status(503).json({ mensaje: 'Primero configura backend/.env (consulta README).' });
  const { usuario, clave } = req.body || {};
  const a = crypto.createHash('sha256').update(String(usuario || '') + '\0' + String(clave || '')).digest();
  const b = crypto.createHash('sha256').update(USER + '\0' + PASSWORD).digest();
  if (!crypto.timingSafeEqual(a, b)) return res.status(401).json({ mensaje: 'Usuario o contraseña incorrectos.' });
  res.json({ token: firmar({ usuario: USER, exp: Date.now() + 8 * 60 * 60 * 1000 }) });
});
app.get('/api/admin/estudiantes', validarToken, (req, res) => {
  res.json(db.prepare('SELECT * FROM estudiantes ORDER BY id DESC').all());
});
app.put('/api/admin/estudiantes/:id', validarToken, (req, res) => {
  const d = { ...req.body, fechaNacimiento: req.body?.fecha_nacimiento };
  if (!datosValidos(d)) return res.status(400).json({ mensaje: 'Revisa los datos del estudiante.' });
  try {
    const resultado = db.prepare('UPDATE estudiantes SET nombre=?, fecha_nacimiento=?, celular=?, emergencia=?, nivel=? WHERE id=?')
      .run(d.nombre.trim(), d.fechaNacimiento, d.celular, d.emergencia, d.nivel, req.params.id);
    if (!resultado.changes) return res.status(404).json({ mensaje: 'No existe ese estudiante.' });
    res.json({ mensaje: 'Estudiante actualizado.' });
  } catch (error) {
    if (error.code?.startsWith('SQLITE_CONSTRAINT')) return res.status(409).json({ mensaje: 'Ya existe un estudiante con ese nombre y fecha.' });
    res.status(500).json({ mensaje: 'No se pudo actualizar.' });
  }
});
app.delete('/api/admin/estudiantes/:id', validarToken, (req, res) => {
  const resultado = db.prepare('DELETE FROM estudiantes WHERE id=?').run(req.params.id);
  if (!resultado.changes) return res.status(404).json({ mensaje: 'No existe ese estudiante.' });
  res.json({ mensaje: 'Estudiante eliminado.' });
});
app.listen(PORT, () => console.log('API disponible en http://localhost:' + PORT));
