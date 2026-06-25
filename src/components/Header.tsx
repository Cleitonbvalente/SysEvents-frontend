import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { obterToken, removerToken, obterDadosUsuario, removerDadosUsuario } from '../services/api';
import './Header.css';

const Header: React.FC = () => {
  const [menuAberto, setMenuAberto] = useState(false);
  const location = useLocation();
  const token = obterToken();
  const usuario = obterDadosUsuario();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/registrar';
  const primeiroNome = usuario?.nome?.split(' ')[0] ?? '';

  const handleLogout = () => {
    removerToken();
    removerDadosUsuario();
    window.location.href = '/';
  };

  return (
    <header className="header">
      <div className="logo">
        <Link to="/" className="logo-link">
          <h1>🎫 SysEvents</h1>
        </Link>
      </div>

      {!isAuthPage && (
        <>
          <button
            className="menu-hamburger"
            onClick={() => setMenuAberto(!menuAberto)}
            aria-label="Menu"
          >
            ☰
          </button>

          <nav className={`nav ${menuAberto ? 'active' : ''}`}>
            <ul>
              <li><a href="#home">Início</a></li>
              <li><a href="#eventos">Eventos</a></li>
              <li><a href="#palestrantes">Palestrantes</a></li>
              <li><a href="#contato">Contato</a></li>
            </ul>
            <ul className="nav-auth">
              {token ? (
                <>
                  {usuario?.papel === 'admin' && (
                    <li>
                      <Link to="/admin/usuarios" className="nav-btn nav-btn-admin">
                        🛡️ Admin
                      </Link>
                    </li>
                  )}
                  <li>
                    <Link to="/perfil" className="usuario-chip">
                      <div className="usuario-avatar-mini">
                        {usuario?.avatar
                          ? <img src={usuario.avatar} alt={primeiroNome} />
                          : primeiroNome.charAt(0).toUpperCase()
                        }
                      </div>
                      <span>{primeiroNome}</span>
                    </Link>
                  </li>
                  <li>
                    <button className="nav-btn nav-btn-outline" onClick={handleLogout}>
                      Sair
                    </button>
                  </li>
                </>
              ) : (
                <>
                  <li><Link to="/login" className="nav-btn nav-btn-outline">Entrar</Link></li>
                  <li><Link to="/registrar" className="nav-btn nav-btn-solid">Criar conta</Link></li>
                </>
              )}
            </ul>
          </nav>
        </>
      )}
    </header>
  );
};

export default Header;
