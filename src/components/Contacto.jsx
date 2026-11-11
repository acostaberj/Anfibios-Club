
import { useState } from 'react';

// Dirección del backend publicado en Render.
const API = "https://anfibios-club-backend.onrender.com/api";

// El formulario guarda datos en la base de datos mediante el backend.
export default function Contacto() {
  const [mensaje, setMensaje] = useState('');
  const [enviando, setEnviando] = useState(false);

  async function registrar(evento) {
    evento.preventDefault();

    const formulario = evento.currentTarget;
    const datos = new FormData(formulario);

    const estudiante = {
      nombre: String(datos.get('nombre') || '').trim(),
      fechaNacimiento: String(datos.get('fechaNacimiento') || ''),
      celular: String(datos.get('celular') || '').trim(),
      emergencia: String(datos.get('emergencia') || '').trim(),
      nivel: String(datos.get('nivel') || '')
    };

    setEnviando(true);
    setMensaje('');

    try {
      const respuesta = await fetch(`${API}/estudiantes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(estudiante)
      });

      const resultado = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(
          resultado.mensaje || 'No se pudo registrar.'
        );
      }

      setMensaje(resultado.mensaje);
      formulario.reset();

    } catch (error) {
      setMensaje(
        error.message || 'No se pudo conectar con el servidor.'
      );

    } finally {
      setEnviando(false);
    }
  }

  return (
    <section id="contacto">
      <h2 className="contact-title">Contáctanos</h2>

      <div className="form-container">
        <form onSubmit={registrar}>

          <div className="form-group">
            <label htmlFor="nombre">Nombre Completo *</label>
            <input
              id="nombre"
              name="nombre"
              type="text"
              required
              maxLength="100"
              placeholder="Ej. Sahara Ayus"
            />
          </div>

          <div className="form-group">
            <label htmlFor="fechaNacimiento">
              Fecha de Nacimiento *
            </label>
            <input
              id="fechaNacimiento"
              name="fechaNacimiento"
              type="date"
              max={new Date().toISOString().slice(0, 10)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="celular">Celular *</label>
            <input
              id="celular"
              name="celular"
              type="tel"
              inputMode="numeric"
              pattern="[0-9]{10}"
              maxLength="10"
              required
              placeholder="Ej. 3104325368"
            />
          </div>

          <div className="form-group">
            <label>Nivel de Experiencia *</label>

            <div className="radio-group">
              <label>
                <input
                  type="radio"
                  name="nivel"
                  value="basico"
                  required
                />
                Básico
              </label>

              <label>
                <input
                  type="radio"
                  name="nivel"
                  value="intermedio"
                />
                Intermedio
              </label>

              <label>
                <input
                  type="radio"
                  name="nivel"
                  value="avanzado"
                />
                Avanzado
              </label>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="emergencia">
              Teléfono de Emergencia *
            </label>

            <input
              id="emergencia"
              name="emergencia"
              type="tel"
              inputMode="numeric"
              pattern="[0-9]{10}"
              maxLength="10"
              required
              placeholder="Contacto en caso de emergencia"
            />
          </div>

          <div className="form-group terms">
            <input
              id="terminos"
              name="terminos"
              type="checkbox"
              required
            />

            <label htmlFor="terminos">
              Acepto los términos de <strong>Anfibios Club</strong> y
              confirmo que soy apto para realizar actividad física en el agua.
            </label>
          </div>

          <button
            className="btn-submit"
            type="submit"
            disabled={enviando}
          >
            {enviando ? 'GUARDANDO...' : 'AGENDAR CLASE'}
          </button>

          <p className="form-footer-text">
            El agua te escucha.
          </p>

          <p
            role="status"
            aria-live="polite"
            className="mensaje-confirmacion"
          >
            {mensaje}
          </p>

        </form>
      </div>
    </section>
  );
}
