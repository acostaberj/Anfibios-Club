const formulario = document.getElementById("formularioInscripcion");

const nombre = document.getElementById("nombre");
const fechaNacimiento = document.getElementById("fecha_nacimiento");
const celular = document.getElementById("tel");
const emergencia = document.getElementById("emergencia");
const terminos = document.getElementById("terminos");

function mostrarDatos() {
    console.log("Nombre:", nombre.value);
    console.log("Fecha de nacimiento:", fechaNacimiento.value);
    console.log("Celular:", celular.value);
    console.log("Emergencia:", emergencia.value);
}

formulario.addEventListener("submit", function(event) {
    event.preventDefault();
    mostrarDatos();
});