import { useState } from 'react';

// Esta es la dirección de nuestro servidor.
const API = '/api';

export default function Admin() {
  const [usuario, setUsuario] = useState('');
  const [clave, setClave] = useState('');
  const [token, setToken] = useState(sessionStorage.getItem('anfibios_token') || '');
  const [estudiantes, setEstudiantes] = useState([]);
  const [mensaje, setMensaje] = useState('');
  const [editando, setEditando] = useState(null);

  // Esta función envía solicitudes al servidor y muestra errores claros.
  async function solicitar(ruta, opciones = {}, credencial = token) {
    const respuesta = await fetch(API + ruta, {
      ...opciones,
      headers: {
        'Content-Type': 'application/json',
        ...(credencial ? { Authorization: 'Bearer ' + credencial } : {}),
        ...opciones.headers
      }
    });

    // Leemos la respuesta como texto para evitar errores si viene vacía.
    const texto = await respuesta.text();
    let datos = {};

    if (texto) {
      try {
        datos = JSON.parse(texto);
      } catch {
        throw new Error('El servidor respondió con un formato inesperado.');
      }
    }

    if (!respuesta.ok) {
      throw new Error(datos.mensaje || 'No se pudo completar la solicitud.');
    }

    return datos;
  }

  // Carga la lista de estudiantes registrados.
  async function cargar(credencial = token) {
    try {
      const lista = await solicitar('/admin/estudiantes', {}, credencial);
      setEstudiantes(lista);
      setMensaje('');
    } catch (error) {
      setMensaje(error.message);
    }
  }

  // Envía el usuario y la contraseña al servidor.
  async function ingresar(evento) {
    evento.preventDefault();
    setMensaje('');

    try {
      const datos = await solicitar('/admin/login', {
        method: 'POST',
        body: JSON.stringify({ usuario, clave })
      }, '');

      sessionStorage.setItem('anfibios_token', datos.token);
      setToken(datos.token);
      setClave('');
      await cargar(datos.token);
    } catch (error) {
      setMensaje(error.message);
    }
  }

  // Cierra la sesión del administrador.
  function salir() {
    sessionStorage.removeItem('anfibios_token');
    setToken('');
    setEstudiantes([]);
    setEditando(null);
    setMensaje('');
  }

  // Elimina un estudiante después de pedir confirmación.
  async function borrar(id) {
    if (!window.confirm('¿Estás seguro de eliminar este estudiante?')) return;

    try {
      await solicitar('/admin/estudiantes/' + id, { method: 'DELETE' });
      await cargar();
      setMensaje('Estudiante eliminado correctamente.');
    } catch (error) {
      setMensaje(error.message);
    }
  }

  // Guarda los cambios de un estudiante.
  async function guardar(evento) {
    evento.preventDefault();

    try {
      await solicitar('/admin/estudiantes/' + editando.id, {
        method: 'PUT',
        body: JSON.stringify(editando)
      });

      setEditando(null);
      await cargar();
      setMensaje('Estudiante actualizado correctamente.');
    } catch (error) {
      setMensaje(error.message);
    }
  }

  return (
    <main className="admin-page">
      <h1>Administración de Anfibios Club</h1>
      <p><a href="/">Volver a la página principal</a></p>

      {!token ? (
        <form onSubmit={ingresar}>
          <h2>Iniciar sesión</h2>

          <label>
            Usuario
            <input
              value={usuario}
              onChange={(evento) => setUsuario(evento.target.value)}
              required
            />
          </label>

          <label>
            Contraseña
            <input
              type="password"
              value={clave}
              onChange={(evento) => setClave(evento.target.value)}
              required
            />
          </label>

          <button type="submit">Iniciar sesión</button>
        </form>
      ) : (
        <>
          <p>
            <button onClick={() => cargar()}>Actualizar registros</button>
            <button onClick={salir}>Cerrar sesión</button>
          </p>

          {editando && (
            <form onSubmit={guardar}>
              <h2>Editar estudiante</h2>

              <label>
                Nombre
                <input
                  value={editando.nombre}
                  onChange={(evento) =>
                    setEditando({ ...editando, nombre: evento.target.value })
                  }
                  required
                />
              </label>

              <label>
                Fecha de nacimiento
                <input
                  type="date"
                  value={editando.fecha_nacimiento}
                  onChange={(evento) =>
                    setEditando({ ...editando, fecha_nacimiento: evento.target.value })
                  }
                  required
                />
              </label>

              <label>
                Celular
                <input
                  value={editando.celular}
                  onChange={(evento) =>
                    setEditando({ ...editando, celular: evento.target.value })
                  }
                  pattern="[0-9]{10}"
                  required
                />
              </label>

              <label>
                Teléfono de emergencia
                <input
                  value={editando.emergencia}
                  onChange={(evento) =>
                    setEditando({ ...editando, emergencia: evento.target.value })
                  }
                  pattern="[0-9]{10}"
                  required
                />
              </label>

              <label>
                Nivel
                <select
                  value={editando.nivel}
                  onChange={(evento) =>
                    setEditando({ ...editando, nivel: evento.target.value })
                  }
                >
                  <option value="basico">Básico</option>
                  <option value="intermedio">Intermedio</option>
                  <option value="avanzado">Avanzado</option>
                </select>
              </label>

              <button type="submit">Guardar cambios</button>
              <button type="button" onClick={() => setEditando(null)}>Cancelar</button>
            </form>
          )}

          <h2>Estudiantes registrados: {estudiantes.length}</h2>

          <div className="admin-tabla">
            <table>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Fecha de nacimiento</th>
                  <th>Celular</th>
                  <th>Emergencia</th>
                  <th>Nivel</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {estudiantes.map((estudiante) => (
                  <tr key={estudiante.id}>
                    <td>{estudiante.nombre}</td>
                    <td>{estudiante.fecha_nacimiento}</td>
                    <td>{estudiante.celular}</td>
                    <td>{estudiante.emergencia}</td>
                    <td>{estudiante.nivel}</td>
                    <td>
                      <button onClick={() => setEditando(estudiante)}>Editar</button>
                      <button className="peligro" onClick={() => borrar(estudiante.id)}>
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      <p role="status" aria-live="polite">{mensaje}</p>
    </main>
  );
}
