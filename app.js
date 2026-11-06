
/* ============================================
   ANFIBIOS CLUB
   INSCRIPCIONES DE ESTUDIANTES
============================================ */

document.addEventListener("DOMContentLoaded", function () {

    // 1. OBTENER LOS ELEMENTOS DEL FORMULARIO

    const formularioInscripcion =
        document.getElementById("formularioInscripcion");

    const mensajeConfirmacion =
        document.getElementById("mensajeConfirmacion");


    // 2. OBTENER EL NIVEL SELECCIONADO

    function obtenerNivel() {

        const nivelSeleccionado =
            document.querySelector('input[name="nivel"]:checked');

        return nivelSeleccionado
            ? nivelSeleccionado.value
            : "";

    }


    // 3. ESCUCHAR EL ENVÍO DEL FORMULARIO

    if (formularioInscripcion) {

        formularioInscripcion.addEventListener(
            "submit",
            async function (event) {

                event.preventDefault();

                // Obtener los campos

                const nombre =
                    document.getElementById("nombre");

                const fechaNacimiento =
                    document.getElementById("fecha_nacimiento");

                const celular =
                    document.getElementById("tel");

                const emergencia =
                    document.getElementById("emergencia");

                const terminos =
                    document.getElementById("terminos");


                // 4. VALIDAR LOS CAMPOS

                if (
                    !nombre ||
                    !fechaNacimiento ||
                    !celular ||
                    !emergencia ||
                    !terminos
                ) {

                    console.error(
                        "No se encontraron todos los campos del formulario."
                    );

                    return;

                }


                if (!terminos.checked) {

                    mensajeConfirmacion.textContent =
                        "Debes aceptar los términos y condiciones.";

                    return;

                }


                // Comprobar el nivel seleccionado

                const nivel = obtenerNivel();

                if (!nivel) {

                    mensajeConfirmacion.textContent =
                        "Debes seleccionar un nivel de natación.";

                    return;

                }


                // 5. PREPARAR LOS DATOS DEL ESTUDIANTE

                const estudiante = {

                    nombre: nombre.value.trim(),

                    fechaNacimiento:
                        fechaNacimiento.value,

                    celular: celular.value.trim(),

                    emergencia: emergencia.value.trim(),

                    nivel: nivel

                };


                try {

                    mensajeConfirmacion.textContent =
                        "Registrando estudiante...";


                    // 6. ENVIAR LOS DATOS AL SERVIDOR

                    const respuesta = await fetch(
                        "http://localhost:3000/api/estudiantes",
                        {

                            method: "POST",

                            headers: {
                                "Content-Type": "application/json"
                            },

                            body: JSON.stringify(estudiante)

                        }
                    );


                    const datos = await respuesta.json();


                    // 7. COMPROBAR LA RESPUESTA

                    if (!respuesta.ok) {

                        throw new Error(
                            datos.mensaje ||
                            "No fue posible registrar al estudiante."
                        );

                    }


                    // 8. MOSTRAR CONFIRMACIÓN

                    mensajeConfirmacion.textContent =
                        datos.mensaje ||
                        "¡Inscripción realizada correctamente!";


                    // 9. LIMPIAR EL FORMULARIO

                    formularioInscripcion.reset();


                } catch (error) {

                    console.error(
                        "Error en la inscripción:",
                        error
                    );

                    mensajeConfirmacion.textContent =
                        error.message;

                }

            }
        );

    }


    console.log(
        "Anfibios Club: formulario de inscripción preparado correctamente."
    );

});
