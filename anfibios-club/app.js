


   //1. SELECCIONAR ELEMENTOS DEL HTML


// Seleccionamos el formulario principal.
const formulario = document.getElementById("formularioInscripcion");

const nombre = document.getElementById("nombre");
const fechaNacimiento = document.getElementById("fecha_nacimiento");
const celular = document.getElementById("tel");
const emergencia = document.getElementById("emergencia");
const terminos = document.getElementById("terminos");


const mensajeConfirmacion = document.getElementById("mensajeConfirmacion");


  // 2. RESTRINGIR LOS CARACTERES PERMITIDOS

nombre.addEventListener("input", function() {

    this.value = this.value.replace(
        /[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s'-]/g,
        ""
    );

});

celular.addEventListener("input", function() {

    this.value = this.value.replace(/[^0-9]/g, "");

});

emergencia.addEventListener("input", function() {

    this.value = this.value.replace(/[^0-9]/g, "");

});


//   3. OBTENER EL NIVEL DE NATACIÓN SELECCIONADO


function obtenerNivel() {


    const nivelSeleccionado = document.querySelector(
        'input[name="nivel"]:checked'
    );

    if (nivelSeleccionado) {

        return nivelSeleccionado.value;

    } else {

        return "No seleccionado";

    }

}



  // 4. MOSTRAR LOS DATOS DEL ESTUDIANTE


function mostrarDatos() {

    console.log("Nombre:", nombre.value);
    console.log("Fecha de nacimiento:", fechaNacimiento.value);
    console.log("Celular:", celular.value);
    console.log("Teléfono de emergencia:", emergencia.value);
    console.log("Nivel de natación:", obtenerNivel());
    console.log("Aceptó los términos:", terminos.checked);

}

// 5. RECUPERAR LOS ESTUDIANTES GUARDADOS

function obtenerEstudiantes() {

    const datosGuardados = localStorage.getItem("estudiantes");

    const estudiantes = JSON.parse(datosGuardados) || [];

    return estudiantes;

}



// 6. REGISTRAR UN NUEVO ESTUDIANTE

function registrarEstudiante() {

    // Recuperar los estudiantes existentes
    const estudiantes = obtenerEstudiantes();

    // Crear el objeto con los datos del nuevo estudiante
    const nuevoEstudiante = {
        nombre: nombre.value.trim(),
        fechaNacimiento: fechaNacimiento.value,
        celular: celular.value,
        emergencia: emergencia.value,
        nivel: obtenerNivel()
    };

    // Buscar si el estudiante ya está registrado
    const duplicado = estudiantes.find(function(estudiante) {

        return estudiante.nombre.toLowerCase() === nuevoEstudiante.nombre.toLowerCase() &&
               estudiante.fechaNacimiento === nuevoEstudiante.fechaNacimiento;

    });

    // Comprobar si existe un registro duplicado
    if (duplicado) {

        mensajeConfirmacion.textContent =
            "Este estudiante ya se encuentra registrado.";

        return false;

    }

    // Agregar el nuevo estudiante al arreglo
    estudiantes.push(nuevoEstudiante);

    // Guardar nuevamente todos los estudiantes
    localStorage.setItem("estudiantes", JSON.stringify(estudiantes));

    mensajeConfirmacion.textContent =
        "¡Inscripción realizada correctamente!";

    return true;
}




// 7. DETECTAR EL ENVÍO DEL FORMULARIO

formulario.addEventListener("submit", function(event) {

    event.preventDefault();
    const registroExitoso = registrarEstudiante();

    if (registroExitoso) {

        mostrarDatos();

        formulario.reset();

    }

});