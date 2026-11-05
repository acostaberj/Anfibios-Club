


   //1. SELECCIONAR ELEMENTOS DEL HTML


// Seleccionamos el formulario principal.
const formulario = document.getElementById("formularioInscripcion");

const nombre = document.getElementById("nombre");
const fechaNacimiento = document.getElementById("fecha_nacimiento");
const celular = document.getElementById("tel");
const emergencia = document.getElementById("emergencia");
const terminos = document.getElementById("terminos");



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



   //5. DETECTAR EL ENVÍO DEL FORMULARIO

formulario.addEventListener("submit", function(event) {

    event.preventDefault();

    mostrarDatos();

});
