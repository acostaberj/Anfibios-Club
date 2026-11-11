
import React, { useState, useEffect } from 'react';

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
  const [ruta, setRuta] = useState(window.location.hash);

  useEffect(() => {
    const actualizarRuta = () => {
      setRuta(window.location.hash);
    };

    window.addEventListener('hashchange', actualizarRuta);

    return () => {
      window.removeEventListener('hashchange', actualizarRuta);
    };
  }, []);

  // Panel administrativo
  if (ruta === '#/admin') {
    return <Admin />;
  }

  // Página principal
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

      <Chatbot />
    </>
  );
}
