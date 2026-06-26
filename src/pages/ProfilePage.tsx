import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  obterToken,
  obterDadosUsuario,
  buscarPerfilUsuario,
  atualizarPerfil,
  removerToken,
  removerDadosUsuario,
  salvarDadosUsuario,
} from '../services/api';
import { Usuario } from '../types';
import './ProfilePage.css';

const PAPEL_LABEL: Record<string, { emoji: string; texto: string }> = {
  participante: { emoji: '👤', texto: 'Participante' },
  organizador:  { emoji: '🗂️', texto: 'Organizador' },
  palestrante:  { emoji: '🎤', texto: 'Palestrante' },
  admin:        { emoji: '🛡️', texto: 'Administrador' },
};

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState<Usuario | null>(obterDadosUsuario());
  const [carregando, setCarregando] = useState(true);
  const [modoEdicao, setModoEdicao] = useState(false);
  const [form, setForm] = useState({ nome: '', bio: '', telefone: '', endereco: '', avatar: '' });
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const avatarInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!obterToken()) {
      navigate('/login');
      return;
    }
    buscarPerfilUsuario()
      .then(res => { if (res.success && res.data) setUsuario(res.data); })
      .finally(() => setCarregando(false));
  }, [navigate]);

  const iniciarEdicao = () => {
    if (!usuario) return;
    setForm({
      nome: usuario.nome ?? '',
      bio: usuario.bio ?? '',
      telefone: usuario.telefone ?? '',
      endereco: usuario.endereco ?? '',
      avatar: usuario.avatar ?? '',
    });
    setErro('');
    setSucesso('');
    setModoEdicao(true);
  };

  const cancelarEdicao = () => {
    setModoEdicao(false);
    setErro('');
    setSucesso('');
  };

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setErro('');
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const MAX = 300;
      const scale = Math.min(1, MAX / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      setForm(prev => ({ ...prev, avatar: canvas.toDataURL('image/jpeg', 0.7) }));
    };
    img.src = url;
  };

  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usuario) return;
    if (!form.nome.trim()) {
      setErro('O nome não pode ficar em branco.');
      return;
    }
    setSalvando(true);
    setErro('');
    setSucesso('');
    try {
      const resposta = await atualizarPerfil({
        nome: form.nome.trim(),
        bio: form.bio.trim() || undefined,
        telefone: form.telefone.trim() || undefined,
        endereco: form.endereco.trim() || undefined,
        avatar: form.avatar || undefined,
      });
      if (resposta.success && resposta.data) {
        const dadosAtualizados: Usuario = {
          ...resposta.data,
          avatar: resposta.data.avatar ?? form.avatar ?? usuario?.avatar,
        };
        setUsuario(dadosAtualizados);
        salvarDadosUsuario(dadosAtualizados);
        window.dispatchEvent(new CustomEvent('sysevents:auth-change'));
        setSucesso('Perfil atualizado com sucesso!');
        setTimeout(() => { setSucesso(''); setModoEdicao(false); }, 1500);
      } else {
        setErro(resposta.message || 'Erro ao atualizar perfil. Tente novamente.');
      }
    } catch {
      setErro('Erro de conexão. Verifique sua internet e tente novamente.');
    } finally {
      setSalvando(false);
    }
  };

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
  const avatarPreview = modoEdicao ? form.avatar : usuario.avatar;

  return (
    <div className="profile-page">
      <div className="profile-banner">
        <div
          className={`profile-avatar-wrap${modoEdicao ? ' profile-avatar-editavel' : ''}`}
          onClick={modoEdicao && !salvando ? () => avatarInputRef.current?.click() : undefined}
          title={modoEdicao ? 'Clique para trocar a foto' : undefined}
        >
          {avatarPreview ? (
            <img src={avatarPreview} alt={usuario.nome} className="profile-avatar-img" />
          ) : (
            <div className="profile-avatar-inicial">
              {(modoEdicao ? form.nome : usuario.nome).charAt(0).toUpperCase() || '?'}
            </div>
          )}
          {modoEdicao && <div className="avatar-edit-overlay">📷</div>}
        </div>
        <input
          ref={avatarInputRef}
          type="file"
          accept="image/*"
          onChange={handleAvatarChange}
          style={{ display: 'none' }}
        />
      </div>

      <div className="profile-identity">
        <h1>{modoEdicao ? (form.nome || usuario.nome) : usuario.nome}</h1>
        <p className="profile-email">{usuario.email}</p>
        <span className="profile-papel-badge">
          {papel.emoji} {papel.texto}
        </span>
      </div>

      {modoEdicao ? (
        <form className="profile-edit-form" onSubmit={handleSalvar}>
          <div className="edit-form-grid">
            <div className="form-group form-group-full">
              <label htmlFor="edit-nome">Nome completo</label>
              <input
                id="edit-nome"
                name="nome"
                type="text"
                value={form.nome}
                onChange={handleFormChange}
                required
              />
            </div>

            <div className="form-group form-group-full">
              <label htmlFor="edit-email">E-mail</label>
              <input
                id="edit-email"
                type="email"
                value={usuario.email}
                disabled
                className="input-disabled"
              />
            </div>

            <div className="form-group form-group-full">
              <label htmlFor="edit-bio">Bio</label>
              <textarea
                id="edit-bio"
                name="bio"
                rows={3}
                placeholder="Fale um pouco sobre você..."
                value={form.bio}
                onChange={handleFormChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="edit-telefone">Telefone</label>
              <input
                id="edit-telefone"
                name="telefone"
                type="tel"
                placeholder="(00) 00000-0000"
                value={form.telefone}
                onChange={handleFormChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="edit-endereco">Endereço</label>
              <input
                id="edit-endereco"
                name="endereco"
                type="text"
                placeholder="Rua, número, cidade"
                value={form.endereco}
                onChange={handleFormChange}
              />
            </div>
          </div>

          {erro && <div className="edit-erro">{erro}</div>}
          {sucesso && <div className="edit-sucesso">{sucesso}</div>}

          <div className="edit-actions">
            <button
              type="button"
              className="profile-btn-secondary"
              onClick={cancelarEdicao}
              disabled={salvando}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="profile-btn-primary"
              disabled={salvando}
            >
              {salvando ? 'Salvando...' : 'Salvar alterações'}
            </button>
          </div>
        </form>
      ) : (
        <>
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
            <button className="profile-btn-edit" onClick={iniciarEdicao}>✏️ Editar Perfil</button>
            <button className="profile-btn-danger" onClick={handleLogout}>Sair da conta</button>
          </div>
        </>
      )}
    </div>
  );
};

export default ProfilePage;
