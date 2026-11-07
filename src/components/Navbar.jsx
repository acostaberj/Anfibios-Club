export default function Navbar() {
 return (<header>
<div className="header-container">
<div className="brand-box">
<img className="logo" src="/assets/desalto.webp" alt="Logo de Anfibios Club" />
<h1 className="main-title">ANFIBIOS CLUB</h1>
</div>
<nav className="main-nav">
<a href="#inicio">Inicio</a>
<a href="#mision">Misión</a>
<a href="#instructor">Instructor</a>
<a href="#estilos">Estilos</a>
<a href="#beneficios">Beneficios</a>
<a href="#contacto">Contacto</a>
</nav>
</div>
</header>);
}
