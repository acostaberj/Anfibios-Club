
import { useState } from "react";
import "../styles/chatbot.css";

// Organiza el texto de Gemini para mostrar párrafos, listas y negritas.
function FormatearRespuesta({ texto }) {
  const lineas = texto.split("\n");
  const elementos = [];
  let lista = [];

  function negrita(textoLinea, indice) {
    const partes = textoLinea.split(/(\*\*.*?\*\*)/g);

    return partes.map((parte, i) => {
      if (parte.startsWith("**") && parte.endsWith("**")) {
        return <strong key={`${indice}-${i}`}>{parte.slice(2, -2)}</strong>;
      }

      return parte;
    });
  }

  function cerrarLista() {
    if (lista.length > 0) {
      elementos.push(
        <ul key={`lista-${elementos.length}`}>
          {lista.map((item, i) => (
            <li key={i}>{negrita(item, i)}</li>
          ))}
        </ul>
      );
      lista = [];
    }
  }

  lineas.forEach((linea, indice) => {
    const limpia = linea.trim();

    if (!limpia) {
      cerrarLista();
      return;
    }

    // Detecta elementos de listas numeradas o con viñetas.
    const coincidencia = limpia.match(/^(\d+[\.\)]\s+|[-*]\s+)(.*)/);

    if (coincidencia) {
      lista.push(coincidencia[2]);
    } else {
      cerrarLista();
      elementos.push(
        <p key={`parrafo-${indice}`}>
          {negrita(limpia, indice)}
        </p>
      );
    }
  });

  cerrarLista();

  return <div className="respuesta-formateada">{elementos}</div>;
}

function Chatbot() {
  const [abierto, setAbierto] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [cargando, setCargando] = useState(false);

  const [conversacion, setConversacion] = useState([
    {
      tipo: "bot",
      texto:
        "¡Hola! Soy el asistente de Anfibios Club. 🐸\n\nEstoy aquí para ayudarte. Puedes preguntarme sobre nuestros cursos, estilos de natación y beneficios.",
    },
  ]);

  async function enviarMensaje(e) {
    e.preventDefault();

    const pregunta = mensaje.trim();

    if (!pregunta || cargando) return;

    setConversacion((anterior) => [
      ...anterior,
      { tipo: "usuario", texto: pregunta },
    ]);

    setMensaje("");
    setCargando(true);

    try {
      const respuesta = await fetch("http://localhost:3000/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ mensaje: pregunta }),
      });

      if (!respuesta.ok) {
        throw new Error("No se pudo obtener una respuesta.");
      }

      const datos = await respuesta.json();

      setConversacion((anterior) => [
        ...anterior,
        {
          tipo: "bot",
          texto: datos.respuesta || "No pude generar una respuesta.",
        },
      ]);
    } catch (error) {
      setConversacion((anterior) => [
        ...anterior,
        {
          tipo: "bot",
          texto:
            "Lo siento, ocurrió un problema al conectarme. Inténtalo nuevamente.",
        },
      ]);
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className="chatbot-contenedor">
      <button
        className="chatbot-boton"
        onClick={() => setAbierto(!abierto)}
        aria-label="Abrir asistente"
      >
        {abierto ? "×" : "💬"}
      </button>

      {abierto && (
        <div className="chatbot-ventana">
          <div className="chatbot-encabezado">
            <div>
              <h3>Asistente Anfibios Club</h3>
              <span>Estoy aquí para ayudarte</span>
            </div>

            <button
              className="chatbot-cerrar"
              onClick={() => setAbierto(false)}
              aria-label="Cerrar chat"
            >
              ×
            </button>
          </div>

          <div className="chatbot-mensajes">
            {conversacion.map((item, indice) => (
              <div
                key={indice}
                className={`mensaje-chat ${
                  item.tipo === "usuario" ? "mensaje-usuario" : "mensaje-bot"
                }`}
              >
                {item.tipo === "bot" ? (
                  <FormatearRespuesta texto={item.texto} />
                ) : (
                  <p>{item.texto}</p>
                )}
              </div>
            ))}

            {cargando && (
              <div className="mensaje-chat mensaje-bot">
                <p>Estoy preparando tu respuesta...</p>
              </div>
            )}
          </div>

          <form className="chatbot-formulario" onSubmit={enviarMensaje}>
            <input
              type="text"
              placeholder="Escribe tu pregunta..."
              value={mensaje}
              onChange={(e) => setMensaje(e.target.value)}
              disabled={cargando}
            />

            <button type="submit" disabled={cargando || !mensaje.trim()}>
              Enviar
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default Chatbot;
