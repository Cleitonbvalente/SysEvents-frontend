import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registrarUsuario } from '../services/api';
import './RegisterPage.css';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    nome: '',
    email: '',
    senha: '',
    confirmarSenha: '',
    papel: 'participante',
    avatar: '',
    bio: '',
    telefone: '',
    endereco: '',
  });
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [carregando, setCarregando] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErro('');
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setForm(prev => ({ ...prev, avatar: reader.result as string }));
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    setSucesso('');

    if (form.senha !== form.confirmarSenha) {
      setErro('As senhas não coincidem.');
      return;
    }
    if (form.senha.length < 6) {
      setErro('A senha deve ter no mínimo 6 caracteres.');
      return;
    }

    setCarregando(true);
    try {
      const resposta = await registrarUsuario({
        nome: form.nome,
        email: form.email,
        senha: form.senha,
        papel: form.papel,
        ...(form.avatar && { avatar: form.avatar }),
        ...(form.bio && { bio: form.bio }),
        ...(form.telefone && { telefone: form.telefone }),
        ...(form.endereco && { endereco: form.endereco }),
      });

      if (resposta.success) {
        setSucesso('Conta criada com sucesso! Redirecionando para o login...');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setErro(resposta.message || 'Erro ao criar conta. Tente novamente.');
      }
    } catch {
      setErro('Erro de conexão. Verifique sua internet e tente novamente.');
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <h1>🎫 SysEvents</h1>
          <p>Crie sua conta</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="nome">Nome completo</label>
            <input
              id="nome" name="nome" type="text" placeholder="Seu nome"
              value={form.nome} onChange={handleChange} required autoComplete="name"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">E-mail</label>
            <input
              id="email" name="email" type="email" placeholder="seu@email.com"
              value={form.email} onChange={handleChange} required autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="papel">Perfil</label>
            <select id="papel" name="papel" value={form.papel} onChange={handleChange}>
              <option value="participante">Participante</option>
              <option value="organizador">Organizador</option>
              <option value="palestrante">Palestrante</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="senha">Senha</label>
            <input
              id="senha" name="senha" type="password" placeholder="Mínimo 6 caracteres"
              value={form.senha} onChange={handleChange} required autoComplete="new-password"
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmarSenha">Confirmar senha</label>
            <input
              id="confirmarSenha" name="confirmarSenha" type="password" placeholder="Repita a senha"
              value={form.confirmarSenha} onChange={handleChange} required autoComplete="new-password"
            />
          </div>

          <div className="optional-divider">
            <span>Informações adicionais (opcional)</span>
          </div>

          <div className="avatar-group">
            {form.avatar && (
              <img src={form.avatar} alt="Preview" className="avatar-preview" />
            )}
            <button
              type="button"
              className="avatar-btn"
              onClick={() => avatarInputRef.current?.click()}
            >
              {form.avatar ? '📷 Trocar foto' : '📷 Adicionar foto de perfil'}
            </button>
            <input
              ref={avatarInputRef} type="file" accept="image/*"
              onChange={handleAvatarChange} style={{ display: 'none' }}
            />
          </div>

          <div className="form-group">
            <label htmlFor="bio">Bio</label>
            <textarea
              id="bio" name="bio" rows={3}
              placeholder="Fale um pouco sobre você..."
              value={form.bio} onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="telefone">Telefone</label>
            <input
              id="telefone" name="telefone" type="tel" placeholder="(00) 00000-0000"
              value={form.telefone} onChange={handleChange} autoComplete="tel"
            />
          </div>

          <div className="form-group">
            <label htmlFor="endereco">Endereço</label>
            <input
              id="endereco" name="endereco" type="text" placeholder="Rua, número, cidade"
              value={form.endereco} onChange={handleChange} autoComplete="street-address"
            />
          </div>

          {erro && <div className="auth-erro">{erro}</div>}
          {sucesso && <div className="auth-sucesso">{sucesso}</div>}

          <button type="submit" className="auth-btn" disabled={carregando}>
            {carregando ? 'Criando conta...' : 'Criar conta'}
          </button>
        </form>

        <p className="auth-link">
          Já tem conta? <Link to="/login">Entrar</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
