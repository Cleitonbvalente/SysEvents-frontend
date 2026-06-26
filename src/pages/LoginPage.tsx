import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUsuario, salvarToken, salvarDadosUsuario } from '../services/api';
import './RegisterPage.css';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', senha: '' });
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErro('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro('');
    setCarregando(true);

    try {
      const resposta = await loginUsuario({ email: form.email, senha: form.senha });

      if (resposta.success && resposta.data?.token) {
        salvarToken(resposta.data.token);
        if (resposta.data.usuario) {
          salvarDadosUsuario(resposta.data.usuario);
        }
        window.dispatchEvent(new CustomEvent('sysevents:auth-change'));
        navigate('/');
      } else {
        setErro(resposta.message || 'E-mail ou senha incorretos.');
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
          <p>Entre na sua conta</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">E-mail</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="seu@email.com"
              value={form.email}
              onChange={handleChange}
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="senha">Senha</label>
            <input
              id="senha"
              name="senha"
              type="password"
              placeholder="Sua senha"
              value={form.senha}
              onChange={handleChange}
              required
              autoComplete="current-password"
            />
          </div>

          {erro && <div className="auth-erro">{erro}</div>}

          <button type="submit" className="auth-btn" disabled={carregando}>
            {carregando ? 'Entrando...' : 'Entrar'}
          </button>
        </form>

        <p className="auth-link">
          Não tem conta? <Link to="/registrar">Criar conta</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
