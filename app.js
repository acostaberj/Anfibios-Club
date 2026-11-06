
/* =====================================================
   PROYECTO: ANFIBIOS CLUB
   ARCHIVO: app.js
   DESCRIPCIÓN: Funcionalidades del formulario
===================================================== */

// 1. IDENTIFICAR LOS ELEMENTOS DEL FORMULARIO

const formulario = document.getElementById("formularioInscripcion");

const nombre = document.getElementById("nombre");
const fechaNacimiento = document.getElementById("fecha_nacimiento");
const celular = document.getElementById("tel");
const emergencia = document.getElementById("emergencia");

const mensajeConfirmacion = document.getElementById("mensajeConfirmacion");


// 2. OBTENER EL NIVEL DE NATACIÓN SELECCIONADO

function obtenerNivel() {

    const nivelSeleccionado = document.querySelector(
        'input[name="nivel"]:checked'
    );

    if (nivelSeleccionado) {
        return nivelSeleccionado.value;
    }

    return "";
}


// 3. DETECTAR EL ENVÍO DEL FORMULARIO

formulario.addEventListener("submit", async function(event) {

    // Evitar que la página se recargue
    event.preventDefault();

    // Obtener los datos del estudiante
    const nuevoEstudiante = {

        nombre: nombre.value.trim(),

        fechaNacimiento: fechaNacimiento.value,

        celular: celular.value.trim(),

        emergencia: emergencia.value.trim(),

        nivel: obtenerNivel()

    };

    // Comprobar que exista un nivel seleccionado
    if (!nuevoEstudiante.nivel) {

        mensajeConfirmacion.textContent =
            "Por favor, selecciona un nivel de natación.";

        return;
    }


    // 4. ENVIAR LOS DATOS AL BACKEND

    try {

        const respuesta = await fetch(
            "http://localhost:3000/api/estudiantes",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(nuevoEstudiante)
            }
        );


        // Convertir la respuesta del servidor a JSON
        const datos = await respuesta.json();


        // 5. COMPROBAR SI HUBO ALGÚN ERROR

        if (!respuesta.ok) {

            throw new Error(
                datos.mensaje || "No se pudo realizar la inscripción."
            );

        }


        // 6. MOSTRAR CONFIRMACIÓN

        mensajeConfirmacion.textContent = datos.mensaje;

        console.log("Estudiante registrado:", nuevoEstudiante);


        // 7. LIMPIAR EL FORMULARIO

        formulario.reset();


    } catch (error) {

        // Mostrar el mensaje que devuelve el backend
        mensajeConfirmacion.textContent = error.message;

        console.error("Error al registrar:", error);

    }

});
