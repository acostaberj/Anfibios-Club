# ANFIBIOS CLUB — Documentación del proyecto

## 1. Presentación
Anfibios Club es una escuela de natación. Su página permite conocer el emprendimiento, consultar información sobre la natación y realizar inscripciones.

## 2. Objetivo general
Crear una aplicación web para presentar los servicios de Anfibios Club, recibir inscripciones y permitir que un administrador gestione los registros.

## 3. Objetivos específicos
- Presentar la identidad y la información de Anfibios Club.
- Mostrar los estilos y beneficios de la natación.
- Recibir datos de personas interesadas.
- Guardar inscripciones en una base de datos.
- Permitir consultar, editar y eliminar registros.

## 4. Tecnologías utilizadas
| Tecnología | Función |
|---|---|
| HTML | Estructura de la página. |
| CSS | Diseño, colores y adaptación a pantallas. |
| JavaScript | Acciones y lógica. |
| React | Organizar la interfaz en componentes. |
| Node.js | Ejecutar JavaScript en el servidor. |
| Express | Crear las rutas del servidor. |
| SQLite | Guardar los registros. |
| Vite | Ejecutar React durante el desarrollo. |

## 5. Organización del proyecto

### `src`
Contiene el código de React.
- `App.jsx`: organiza las secciones y muestra el panel en la dirección `/admin`.
- `main.jsx`: inicia React.
- `styles.css`: reúne los estilos CSS.

### `src/components`
Cada archivo representa una parte de la página:
- `Navbar.jsx`: menú de navegación.
- `Inicio.jsx`: presentación inicial.
- `Mision.jsx`: misión y visión.
- `Instructor.jsx`: sección del instructor.
- `Estilos.jsx`: estilos de natación.
- `Beneficios.jsx`: beneficios de nadar.
- `Contacto.jsx`: formulario de inscripción.
- `Footer.jsx`: pie de página.
- `Admin.jsx`: inicio de sesión y administración de estudiantes.

### `src/styles`
Contiene los archivos CSS separados por partes del diseño.

### `public/assets`
Contiene las imágenes de la página.

### `backend`
- `server.js`: recibe solicitudes, valida información y controla el acceso.
- `database.js`: crea y conecta la base de datos SQLite.
- `.env.example`: ejemplo de las variables necesarias.
- `.env`: archivo privado que se crea en cada computador.
- `anfibios.db`: base de datos local que se crea al iniciar el servidor.

## 6. ¿Cómo funciona React?
React permite dividir la página en componentes. Por ejemplo, el menú está en `Navbar.jsx` y el formulario está en `Contacto.jsx`. `App.jsx` importa y organiza esos componentes.

## 7. ¿Cómo funciona el formulario?
1. La persona escribe nombre, fecha de nacimiento, celular, teléfono de emergencia y nivel.
2. React reúne los datos del formulario.
3. React los envía al servidor mediante `POST /api/estudiantes`.
4. Express recibe y valida los datos.
5. SQLite guarda la inscripción.
6. El servidor devuelve un mensaje de confirmación o de error.

## 8. ¿Cómo funciona la base de datos?
SQLite guarda los datos en `backend/anfibios.db`. La tabla `estudiantes` contiene identificador, nombre, fecha de nacimiento, celular, emergencia, nivel y fecha de registro. También existe una restricción para evitar duplicados por nombre y fecha de nacimiento.

## 9. ¿Cómo funciona el panel administrativo?
El panel se abre en `/admin`.
1. El administrador escribe usuario y contraseña configurados en `.env`.
2. React envía los datos a `POST /api/admin/login`.
3. El servidor compara los datos y, si coinciden, entrega un token.
4. React guarda el token durante la sesión.
5. Para consultar, editar o eliminar, React envía el token.
6. El servidor verifica el token antes de permitir la acción.

El panel permite:
- Consultar estudiantes.
- Editar sus datos.
- Eliminar un registro después de pedir confirmación.

## 10. Rutas principales
| Ruta | Método | Función |
|---|---|---|
| `/api/salud` | GET | Comprueba que el servidor esté activo. |
| `/api/estudiantes` | POST | Registra un estudiante. |
| `/api/admin/login` | POST | Inicia la sesión administrativa. |
| `/api/admin/estudiantes` | GET | Consulta registros con sesión válida. |
| `/api/admin/estudiantes/:id` | PUT | Actualiza un registro. |
| `/api/admin/estudiantes/:id` | DELETE | Elimina un registro. |

## 11. Diseño adaptable
Los estilos CSS contienen reglas para adaptar la página a computadores, tabletas y celulares.

## 12. Seguridad
El usuario, la contraseña y la clave secreta se guardan en `backend/.env`. Este archivo no debe compartirse. `.env.example` muestra los nombres de las variables, pero no incluye credenciales reales. La base de datos también contiene información personal y debe mantenerse privada.

## 13. Etapas pendientes
Esta versión se prepara para funcionar localmente. En una etapa posterior se añadirá una función de inteligencia artificial y se publicará el frontend y el backend en internet. La publicación no forma parte de esta entrega.

## 14. Conclusión
Anfibios Club reúne una página informativa, un formulario, un servidor y una base de datos. La separación por componentes y carpetas facilita encontrar el código, comprenderlo y hacer cambios sin modificar toda la aplicación.
