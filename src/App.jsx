
import Navbar from './components/Navbar.jsx';
import Inicio from './components/Inicio.jsx';
import Mision from './components/Mision.jsx';
import Instructor from './components/Instructor.jsx';
import Estilos from './components/Estilos.jsx';
import Beneficios from './components/Beneficios.jsx';
import Contacto from './components/Contacto.jsx';
import Footer from './components/Footer.jsx';
import Admin from './components/Admin.jsx';
import Chatbot from './components/Chatbot.jsx';

export default function App() {

  // Panel administrativo
  if (window.location.pathname.replace(/\/$/, '').endsWith('/admin')) {
    return <Admin />;
  }

  // Página pública
  return (
    <>
      <Navbar />

      <main>
        <Inicio />
        <Mision />
        <Instructor />
        <Estilos />
        <Beneficios />
        <Contacto />
      </main>

      <Footer />

      {/* Asistente virtual de Anfibios Club */}
      <Chatbot />
    </>
  );
}
