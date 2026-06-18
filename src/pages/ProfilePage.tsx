import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  obterToken,
  obterDadosUsuario,
  buscarPerfilUsuario,
  removerToken,
  removerDadosUsuario,
} from '../services/api';
import { Usuario } from '../types';
import './ProfilePage.css';

const PAPEL_LABEL: Record<string, { emoji: string; texto: string }> = {
  participante: { emoji: '👤', texto: 'Participante' },
  organizador:  { emoji: '🗂️', texto: 'Organizador' },
  palestrante:  { emoji: '🎤', texto: 'Palestrante' },
};

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState<Usuario | null>(obterDadosUsuario());
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    if (!obterToken()) {
      navigate('/login');
      return;
    }
    buscarPerfilUsuario()
      .then(res => { if (res.success && res.data) setUsuario(res.data); })
      .finally(() => setCarregando(false));
  }, [navigate]);

  const handleLogout = () => {
    removerToken();
    removerDadosUsuario();
    navigate('/');
  };

  if (carregando && !usuario) {
    return (
      <div className="profile-loading">
        <div className="loading-spinner" />
        <p>Carregando perfil...</p>
      </div>
    );
  }

  if (!usuario) {
    return (
      <div className="profile-loading">
        <p>Não foi possível carregar o perfil.</p>
        <Link to="/">Voltar ao início</Link>
      </div>
    );
  }

  const papel = PAPEL_LABEL[usuario.papel] ?? { emoji: '👤', texto: usuario.papel };

  return (
    <div className="profile-page">
      <div className="profile-banner">
        <div className="profile-avatar-wrap">
          {usuario.avatar ? (
            <img src={usuario.avatar} alt={usuario.nome} className="profile-avatar-img" />
          ) : (
            <div className="profile-avatar-inicial">
              {usuario.nome.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
      </div>

      <div className="profile-identity">
        <h1>{usuario.nome}</h1>
        <p className="profile-email">{usuario.email}</p>
        <span className="profile-papel-badge">
          {papel.emoji} {papel.texto}
        </span>
      </div>

      <div className="profile-info-grid">
        {usuario.bio && (
          <div className="info-card info-card-full">
            <span className="info-label">Bio</span>
            <p>{usuario.bio}</p>
          </div>
        )}
        {usuario.telefone && (
          <div className="info-card">
            <span className="info-label">📞 Telefone</span>
            <p>{usuario.telefone}</p>
          </div>
        )}
        {usuario.endereco && (
          <div className="info-card">
            <span className="info-label">📍 Endereço</span>
            <p>{usuario.endereco}</p>
          </div>
        )}
        {!usuario.bio && !usuario.telefone && !usuario.endereco && (
          <div className="info-card info-card-full info-card-empty">
            <p>Nenhuma informação adicional cadastrada.</p>
          </div>
        )}
      </div>

      <div className="profile-actions">
        <Link to="/" className="profile-btn-secondary">← Voltar ao início</Link>
        <button className="profile-btn-danger" onClick={handleLogout}>Sair da conta</button>
      </div>
    </div>
  );
};

export default ProfilePage;
