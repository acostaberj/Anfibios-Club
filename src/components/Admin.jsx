import { useState } from 'react';

export default function Admin() {
  const [usuario, setUsuario] = useState('');
  const [clave, setClave] = useState('');
  const [token, setToken] = useState(sessionStorage.getItem('anfibios_token') || '');
  const [estudiantes, setEstudiantes] = useState([]);
  const [mensaje, setMensaje] = useState('');
  const [editando, setEditando] = useState(null);

  async function solicitar(ruta, opciones = {}, credencial = token) {
    const respuesta = await fetch('/api/admin' + ruta, {
      ...opciones,
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + credencial, ...opciones.headers }
    });
    const datos = await respuesta.json();
    if (!respuesta.ok) throw new Error(datos.mensaje || 'Ocurrió un error.');
    return datos;
  }

  async function cargar(credencial = token) {
    try { setEstudiantes(await solicitar('/estudiantes', {}, credencial)); setMensaje(''); }
    catch (error) { setMensaje(error.message); }
  }

  async function ingresar(evento) {
    evento.preventDefault();
    try {
      const datos = await solicitar('/login', { method: 'POST', body: JSON.stringify({ usuario, clave }) }, '');
      sessionStorage.setItem('anfibios_token', datos.token);
      setToken(datos.token);
      setClave('');
      await cargar(datos.token);
    } catch (error) { setMensaje(error.message); }
  }

  function salir() { sessionStorage.removeItem('anfibios_token'); setToken(''); setEstudiantes([]); setEditando(null); }

  async function borrar(id) {
    if (!window.confirm('¿Eliminar este registro?')) return;
    try { await solicitar('/estudiantes/' + id, { method: 'DELETE' }); await cargar(); }
    catch (error) { setMensaje(error.message); }
  }

  async function guardar(evento) {
    evento.preventDefault();
    try {
      await solicitar('/estudiantes/' + editando.id, { method: 'PUT', body: JSON.stringify(editando) });
      setEditando(null);
      await cargar();
    } catch (error) { setMensaje(error.message); }
  }

  return <div className="admin-page">
    <h1>Administración · Anfibios Club</h1>
    <p><a href="/">Volver a la página principal</a></p>
    {!token ? <form onSubmit={ingresar}>
      <h2>Iniciar sesión</h2>
      <label>Usuario<input value={usuario} onChange={e => setUsuario(e.target.value)} required /></label>
      <label>Contraseña<input type="password" value={clave} onChange={e => setClave(e.target.value)} required /></label>
      <button type="submit">Entrar</button>
    </form> : <>
      <p><button onClick={() => cargar()}>Actualizar registros</button><button onClick={salir}>Cerrar sesión</button></p>
      {editando && <form onSubmit={guardar}>
        <h2>Editar estudiante</h2>
        <label>Nombre<input value={editando.nombre} onChange={e => setEditando({ ...editando, nombre: e.target.value })} required /></label>
        <label>Fecha de nacimiento<input type="date" value={editando.fecha_nacimiento} onChange={e => setEditando({ ...editando, fecha_nacimiento: e.target.value })} required /></label>
        <label>Celular<input value={editando.celular} onChange={e => setEditando({ ...editando, celular: e.target.value })} pattern="[0-9]{10}" required /></label>
        <label>Emergencia<input value={editando.emergencia} onChange={e => setEditando({ ...editando, emergencia: e.target.value })} pattern="[0-9]{10}" required /></label>
        <label>Nivel<select value={editando.nivel} onChange={e => setEditando({ ...editando, nivel: e.target.value })}>
          <option value="basico">Básico</option><option value="intermedio">Intermedio</option><option value="avanzado">Avanzado</option>
        </select></label>
        <button type="submit">Guardar cambios</button><button type="button" onClick={() => setEditando(null)}>Cancelar</button>
      </form>}
      <h2>Estudiantes registrados ({estudiantes.length})</h2>
      <div className="admin-tabla"><table><thead><tr><th>Nombre</th><th>Nacimiento</th><th>Celular</th><th>Emergencia</th><th>Nivel</th><th>Acciones</th></tr></thead>
        <tbody>{estudiantes.map(e => <tr key={e.id}><td>{e.nombre}</td><td>{e.fecha_nacimiento}</td><td>{e.celular}</td><td>{e.emergencia}</td><td>{e.nivel}</td><td><button onClick={() => setEditando(e)}>Editar</button><button className="peligro" onClick={() => borrar(e.id)}>Eliminar</button></td></tr>)}</tbody>
      </table></div>
    </>}
    <p role="status">{mensaje}</p>
  </div>;
}
