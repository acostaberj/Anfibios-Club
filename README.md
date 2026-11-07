# Anfibios Club — versión React

Se convirtió la web original a componentes React sin cambiar los textos de la página, sus imágenes ni los enlaces del pie de página. Se conserva el registro de estudiantes en SQLite. No se ha implementado inteligencia artificial todavía.

## Requisitos

- Node.js 20.19+ o 22.12+ y npm.
- Dos terminales abiertas en Visual Studio Code.

## 1. Iniciar el backend (terminal 1)

```bash
cd backend
npm install
```

Copia `backend/.env.example` como `backend/.env` y **cambia** `ADMIN_PASSWORD` y `JWT_SECRET` por valores privados. No subas `.env` a GitHub.

```bash
npm start
```

El servidor estará en http://localhost:3000 y creará automáticamente `backend/anfibios.db`.

## 2. Iniciar React (terminal 2)

Desde la carpeta principal `Anfibios_Club_React`:

```bash
npm install
npm run dev
```

Abre la dirección que muestre Vite (normalmente http://localhost:5173).

## 3. Usar el proyecto

- Página principal: http://localhost:5173
- Formulario: sección **Contáctanos**. Al enviar, los datos se guardan en SQLite a través de la API.
- Panel administrativo: http://localhost:5173/admin. Entra con el usuario y contraseña definidos en `backend/.env`. Puedes listar, editar y eliminar registros.

## Estructura

- `src/components/`: una sección de la página por archivo (`Inicio`, `Mision`, `Instructor`, `Estilos`, `Beneficios`, `Contacto`, `Footer`, `Navbar`, `Admin`).
- `src/styles/`: los CSS originales, para conservar el diseño.
- `public/assets/`: imágenes originales.
- `backend/server.js`: rutas y validación de la API.
- `backend/database.js`: tabla SQLite y protección contra registros duplicados.
- `vite.config.js`: conecta React con el backend durante el desarrollo.

## Para publicar

El frontend puede compilarse con `npm run build` y publicar `dist/` en GitHub Pages. **GitHub Pages no ejecuta Node.js ni SQLite**: el backend necesita alojamiento separado con almacenamiento persistente y HTTPS, y en producción hay que configurar la dirección de la API. Por tanto, esta entrega está preparada para ejecutarse localmente, pero no se presenta como desplegada en internet.

## Pendientes de la entrega final

- Integrar una función de IA útil, cuando se autorice esa etapa.
- Publicar el frontend y el backend, y verificar los formularios en producción.
- Revisar enlaces genéricos de Instagram, Facebook y Maps cuando se disponga de los enlaces oficiales.
- Registrar y subir los commits requeridos al repositorio GitHub (no se crean commits automáticamente en esta copia ZIP).
