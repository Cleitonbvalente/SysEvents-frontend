import React, { useState } from 'react';
import './Header.css';

const Header: React.FC = () => {
  const [menuAberto, setMenuAberto] = useState(false);

  const toggleMenu = () => {
    setMenuAberto(!menuAberto);
  };

  return (
    <header className="header">
      <div className="logo">
        <h1>🎫 SysEvents</h1>
      </div>
      
      <button className="menu-hamburger" onClick={toggleMenu}>
        ☰
      </button>
      
      <nav className={`nav ${menuAberto ? 'active' : ''}`}>
        <ul>
          <li><a href="#home">Início</a></li>
          <li><a href="#eventos">Eventos</a></li>
          <li><a href="#palestrantes">Palestrantes</a></li>
          <li><a href="#contato">Contato</a></li>
        </ul>
      </nav>
    </header>
  );
};

export default Header;
