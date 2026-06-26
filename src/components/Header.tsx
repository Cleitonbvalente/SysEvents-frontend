import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { obterToken, removerToken, obterDadosUsuario, removerDadosUsuario } from '../services/api';
import './Header.css';

const Header: React.FC = () => {
  const [menuAberto, setMenuAberto] = useState(false);
  const [token, setToken] = useState(obterToken());
  const [usuario, setUsuario] = useState(obterDadosUsuario());
  const location = useLocation();

  useEffect(() => {
    setMenuAberto(false);
  }, [location.pathname]);

  useEffect(() => {
    const sync = () => {
      setToken(obterToken());
      setUsuario(obterDadosUsuario());
    };
    window.addEventListener('sysevents:auth-change', sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('sysevents:auth-change', sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const isAuthPage = location.pathname === '/login' || location.pathname === '/registrar';
  const primeiroNome = usuario?.nome?.split(' ')[0] ?? '';

  const handleLogout = () => {
    removerToken();
    removerDadosUsuario();
    window.dispatchEvent(new CustomEvent('sysevents:auth-change'));
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
            aria-expanded={menuAberto}
          >
            {menuAberto ? '✕' : '☰'}
          </button>

          <nav className={`nav ${menuAberto ? 'active' : ''}`}>
            <ul>
              <li><a href="#home" onClick={() => setMenuAberto(false)}>Início</a></li>
              <li><a href="#eventos" onClick={() => setMenuAberto(false)}>Eventos</a></li>
              <li><a href="#palestrantes" onClick={() => setMenuAberto(false)}>Palestrantes</a></li>
              <li><a href="#contato" onClick={() => setMenuAberto(false)}>Contato</a></li>
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
