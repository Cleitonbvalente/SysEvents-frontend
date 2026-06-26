import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  obterToken,
  obterDadosUsuario,
  buscarTodosUsuarios,
  atualizarUsuario,
  deletarUsuario,
} from '../services/api';
import { Usuario } from '../types';
import './AdminUsuariosPage.css';

const PAPEL_LABEL: Record<string, { emoji: string; texto: string; cor: string }> = {
  participante: { emoji: '👤', texto: 'Participante', cor: '#4a90d9' },
  organizador:  { emoji: '🗂️', texto: 'Organizador',  cor: '#e67e22' },
  palestrante:  { emoji: '🎤', texto: 'Palestrante',  cor: '#9b59b6' },
  admin:        { emoji: '🛡️', texto: 'Admin',        cor: '#27ae60' },
};

const AdminUsuariosPage: React.FC = () => {
  const navigate = useNavigate();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [busca, setBusca] = useState('');
  const [filtroPapel, setFiltroPapel] = useState('');
  const [usuarioEditando, setUsuarioEditando] = useState<Usuario | null>(null);
  const [formEdit, setFormEdit] = useState({ nome: '', papel: '' });
  const [salvandoEdit, setSalvandoEdit] = useState(false);
  const [erroEdit, setErroEdit] = useState('');
  const [usuarioDeletando, setUsuarioDeletando] = useState<Usuario | null>(null);
  const [deletando, setDeletando] = useState(false);
  const [mensagem, setMensagem] = useState('');

  useEffect(() => {
    const token = obterToken();
    const usuario = obterDadosUsuario();
    if (!token || usuario?.papel !== 'admin') {
      navigate('/');
      return;
    }
    buscarTodosUsuarios()
      .then(res => { if (res.success && res.data) setUsuarios(res.data); })
      .finally(() => setCarregando(false));
  }, [navigate]);

  const meUsuario = obterDadosUsuario();

  const usuariosFiltrados = usuarios.filter(u => {
    const buscaLower = busca.toLowerCase();
    const nomeMatch = u.nome.toLowerCase().includes(buscaLower);
    const emailMatch = u.email.toLowerCase().includes(buscaLower);
    const papelMatch = !filtroPapel || u.papel === filtroPapel;
    return (nomeMatch || emailMatch) && papelMatch;
  });

  const contarPorPapel = (papel: string) =>
    usuarios.filter(u => u.papel === papel).length;

  const abrirEdicao = (u: Usuario) => {
    setUsuarioEditando(u);
    setFormEdit({ nome: u.nome, papel: u.papel });
    setErroEdit('');
  };

  const fecharEdicao = () => {
    setUsuarioEditando(null);
    setErroEdit('');
  };

  const handleSalvarEdicao = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usuarioEditando || !formEdit.nome.trim()) {
      setErroEdit('Nome não pode ficar em branco.');
      return;
    }
    setSalvandoEdit(true);
    setErroEdit('');
    try {
      const res = await atualizarUsuario(usuarioEditando.id, {
        nome: formEdit.nome.trim(),
        papel: formEdit.papel,
      });
      if (res.success) {
        setUsuarios(prev =>
          prev.map(u =>
            u.id === usuarioEditando.id
              ? { ...u, nome: formEdit.nome.trim(), papel: formEdit.papel }
              : u
          )
        );
        exibirMensagem(`Usuário "${formEdit.nome}" atualizado com sucesso.`);
        fecharEdicao();
      } else {
        setErroEdit(res.message || 'Erro ao atualizar usuário.');
      }
    } catch {
      setErroEdit('Erro de conexão.');
    } finally {
      setSalvandoEdit(false);
    }
  };

  const handleDeletar = async () => {
    if (!usuarioDeletando) return;
    setDeletando(true);
    try {
      const res = await deletarUsuario(usuarioDeletando.id);
      if (res.success) {
        setUsuarios(prev => prev.filter(u => u.id !== usuarioDeletando.id));
        exibirMensagem(`Usuário "${usuarioDeletando.nome}" removido com sucesso.`);
      } else {
        exibirMensagem(res.message || 'Erro ao remover usuário.');
      }
    } catch {
      exibirMensagem('Erro de conexão ao tentar excluir.');
    } finally {
      setDeletando(false);
      setUsuarioDeletando(null);
    }
  };

  const exibirMensagem = (msg: string) => {
    setMensagem(msg);
    setTimeout(() => setMensagem(''), 3500);
  };

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div className="admin-header-inner">
          <Link to="/" className="admin-back">← Voltar</Link>
          <div>
            <h1>👥 Gestão de Usuários</h1>
            <p>Gerencie todos os usuários da plataforma</p>
          </div>
        </div>
      </div>

      {mensagem && <div className="admin-toast">{mensagem}</div>}

      <div className="admin-stats">
        <div className="admin-stat-card">
          <strong>{usuarios.length}</strong>
          <span>Total</span>
        </div>
        <div className="admin-stat-card">
          <strong>{contarPorPapel('participante')}</strong>
          <span>Participantes</span>
        </div>
        <div className="admin-stat-card">
          <strong>{contarPorPapel('organizador')}</strong>
          <span>Organizadores</span>
        </div>
        <div className="admin-stat-card">
          <strong>{contarPorPapel('palestrante')}</strong>
          <span>Palestrantes</span>
        </div>
        <div className="admin-stat-card">
          <strong>{contarPorPapel('admin')}</strong>
          <span>Admins</span>
        </div>
      </div>

      <div className="admin-toolbar">
        <input
          className="admin-search"
          type="search"
          placeholder="Buscar por nome ou e-mail..."
          value={busca}
          onChange={e => setBusca(e.target.value)}
        />
        <select
          className="admin-filter"
          value={filtroPapel}
          onChange={e => setFiltroPapel(e.target.value)}
        >
          <option value="">Todos os papéis</option>
          <option value="participante">Participante</option>
          <option value="organizador">Organizador</option>
          <option value="palestrante">Palestrante</option>
          <option value="admin">Admin</option>
        </select>
        <button
          className="admin-reload-btn"
          onClick={() => {
            setCarregando(true);
            buscarTodosUsuarios()
              .then(res => { if (res.success && res.data) setUsuarios(res.data); })
              .finally(() => setCarregando(false));
          }}
          title="Recarregar lista"
          disabled={carregando}
        >
          🔄
        </button>
      </div>

      {!carregando && (
        <p className="admin-count">
          {usuariosFiltrados.length === usuarios.length
            ? `${usuarios.length} usuário${usuarios.length !== 1 ? 's' : ''}`
            : `${usuariosFiltrados.length} de ${usuarios.length} usuário${usuarios.length !== 1 ? 's' : ''}`}
        </p>
      )}

      {carregando ? (
        <div className="admin-loading">
          <div className="loading-spinner" />
          <p>Carregando usuários...</p>
        </div>
      ) : usuariosFiltrados.length === 0 ? (
        <div className="admin-empty">
          <span>🔍</span>
          <p>Nenhum usuário encontrado.</p>
        </div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Usuário</th>
                <th>E-mail</th>
                <th>Papel</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {usuariosFiltrados.map(u => {
                const p = PAPEL_LABEL[u.papel] ?? { emoji: '👤', texto: u.papel, cor: '#888' };
                const ehEuMesmo = u.id === meUsuario?.id;
                return (
                  <tr key={u.id}>
                    <td>
                      <div className="user-cell">
                        <div className="user-mini-avatar">
                          {u.avatar ? (
                            <img src={u.avatar} alt={u.nome} />
                          ) : (
                            <div
                              className="user-mini-inicial"
                              style={{ background: p.cor }}
                            >
                              {u.nome.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="user-cell-info">
                          <strong>{u.nome}</strong>
                          {ehEuMesmo && <span className="eu-badge">você</span>}
                        </div>
                      </div>
                    </td>
                    <td className="email-cell">{u.email}</td>
                    <td>
                      <span
                        className="papel-badge-admin"
                        style={{
                          background: p.cor + '22',
                          color: p.cor,
                          borderColor: p.cor + '55',
                        }}
                      >
                        {p.emoji} {p.texto}
                      </span>
                    </td>
                    <td>
                      <div className="action-btns">
                        <button
                          className="btn-edit"
                          onClick={() => abrirEdicao(u)}
                        >
                          ✏️ Editar
                        </button>
                        {!ehEuMesmo && (
                          <button
                            className="btn-delete"
                            onClick={() => setUsuarioDeletando(u)}
                          >
                            🗑️ Excluir
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de Edição */}
      {usuarioEditando && (
        <div className="modal-overlay" onClick={fecharEdicao}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-header-user">
                <div className="modal-avatar">
                  {usuarioEditando.avatar ? (
                    <img src={usuarioEditando.avatar} alt={usuarioEditando.nome} />
                  ) : (
                    <div
                      className="modal-avatar-inicial"
                      style={{
                        background: (PAPEL_LABEL[usuarioEditando.papel] ?? PAPEL_LABEL['participante']).cor,
                      }}
                    >
                      {usuarioEditando.nome.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <h2>✏️ Editar Usuário</h2>
              </div>
              <button className="modal-close" onClick={fecharEdicao}>✕</button>
            </div>
            <form onSubmit={handleSalvarEdicao} className="modal-form">
              <div className="modal-form-group">
                <label>Nome</label>
                <input
                  type="text"
                  value={formEdit.nome}
                  onChange={e => setFormEdit(prev => ({ ...prev, nome: e.target.value }))}
                  required
                />
              </div>
              <div className="modal-form-group">
                <label>E-mail</label>
                <input type="email" value={usuarioEditando.email} disabled />
              </div>
              <div className="modal-form-group">
                <label>Papel</label>
                <select
                  value={formEdit.papel}
                  onChange={e => setFormEdit(prev => ({ ...prev, papel: e.target.value }))}
                >
                  <option value="participante">Participante</option>
                  <option value="organizador">Organizador</option>
                  <option value="palestrante">Palestrante</option>
                  <option value="admin">Administrador</option>
                </select>
              </div>
              {erroEdit && <div className="modal-erro">{erroEdit}</div>}
              <div className="modal-actions">
                <button type="button" className="btn-cancelar" onClick={fecharEdicao}>
                  Cancelar
                </button>
                <button type="submit" className="btn-salvar" disabled={salvandoEdit}>
                  {salvandoEdit ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Exclusão */}
      {usuarioDeletando && (
        <div className="modal-overlay" onClick={() => setUsuarioDeletando(null)}>
          <div className="modal modal-confirm" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>🗑️ Confirmar exclusão</h2>
            </div>
            <p className="confirm-text">
              Tem certeza que deseja excluir o usuário{' '}
              <strong>{usuarioDeletando.nome}</strong>?
            </p>
            <p className="confirm-warning">Esta ação não pode ser desfeita.</p>
            <div className="modal-actions">
              <button
                className="btn-cancelar"
                onClick={() => setUsuarioDeletando(null)}
                disabled={deletando}
              >
                Cancelar
              </button>
              <button
                className="btn-delete-confirm"
                onClick={handleDeletar}
                disabled={deletando}
              >
                {deletando ? 'Excluindo...' : 'Excluir'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsuariosPage;
