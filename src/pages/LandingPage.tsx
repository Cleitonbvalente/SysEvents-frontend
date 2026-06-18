import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import EventoCard from '../components/EventoCard';
import { Evento, Usuario } from '../types';
import { buscarPalestrantes } from '../services/api';
import './LandingPage.css';

const LandingPage: React.FC = () => {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [palestrantes, setPalestrantes] = useState<Usuario[]>([]);
  const [loadingEventos, setLoadingEventos] = useState(true);
  const [loadingPalestrantes, setLoadingPalestrantes] = useState(true);

  useEffect(() => {
    fetch('https://sysevents-1.onrender.com/api/eventos')
      .then(r => r.json())
      .then((data: { success: boolean; data: Evento[] }) => { if (data.success) setEventos(data.data); })
      .catch(() => {})
      .finally(() => setLoadingEventos(false));

    buscarPalestrantes()
      .then(data => { if (data.success && data.data) setPalestrantes(data.data); })
      .finally(() => setLoadingPalestrantes(false));
  }, []);

  const inicialAvatar = (nome: string) =>
    nome.charAt(0).toUpperCase();

  return (
    <div className="landing-page">
      <main>

        {/* ── HERO ─────────────────────────────────── */}
        <section id="home" className="hero">
          <div className="hero-blob blob-1" />
          <div className="hero-blob blob-2" />
          <div className="hero-content">
            <span className="hero-badge">✨ Plataforma de Gestão de Eventos</span>
            <h1>Conecte-se com os melhores eventos</h1>
            <p>
              Encontre, organize e participe de eventos de tecnologia, cultura e
              entretenimento — tudo em um só lugar.
            </p>
            <div className="hero-actions">
              <a href="#eventos" className="btn-primary">Explorar Eventos</a>
              <Link to="/registrar" className="btn-secondary">Criar conta grátis</Link>
            </div>
          </div>
          <div className="hero-stats">
            <div className="stat">
              <strong>{loadingEventos ? '—' : eventos.length}</strong>
              <span>Eventos</span>
            </div>
            <div className="stat-divider" />
            <div className="stat">
              <strong>{loadingPalestrantes ? '—' : palestrantes.length}</strong>
              <span>Palestrantes</span>
            </div>
            <div className="stat-divider" />
            <div className="stat">
              <strong>100%</strong>
              <span>Gratuito</span>
            </div>
          </div>
        </section>

        {/* ── COMO FUNCIONA ────────────────────────── */}
        <section className="como-funciona">
          <h2>Como funciona</h2>
          <p className="section-subtitle">Três passos simples para começar</p>
          <div className="steps-grid">
            <div className="step-card">
              <div className="step-number">1</div>
              <div className="step-icon">📝</div>
              <h3>Crie sua conta</h3>
              <p>Cadastre-se como participante, organizador ou palestrante em segundos.</p>
            </div>
            <div className="step-card">
              <div className="step-number">2</div>
              <div className="step-icon">🔍</div>
              <h3>Explore eventos</h3>
              <p>Navegue pelo catálogo e descubra eventos que combinam com você.</p>
            </div>
            <div className="step-card">
              <div className="step-number">3</div>
              <div className="step-icon">🎉</div>
              <h3>Participe</h3>
              <p>Inscreva-se e faça parte de experiências ao lado de especialistas.</p>
            </div>
          </div>
        </section>

        {/* ── EVENTOS ──────────────────────────────── */}
        <section id="eventos" className="eventos">
          <h2>Eventos em Destaque</h2>
          <p className="section-subtitle">Confira as próximas experiências</p>

          {loadingEventos ? (
            <div className="loading">
              <div className="loading-spinner" />
              <p>Carregando eventos...</p>
            </div>
          ) : eventos.length > 0 ? (
            <div className="eventos-grid">
              {eventos.map(evento => (
                <EventoCard key={evento.id} evento={evento} />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <span>📅</span>
              <p>Nenhum evento disponível no momento.</p>
            </div>
          )}
        </section>

        {/* ── PALESTRANTES ─────────────────────────── */}
        <section id="palestrantes" className="palestrantes">
          <h2>Palestrantes</h2>
          <p className="section-subtitle">Conheça quem vai transformar sua visão</p>

          {loadingPalestrantes ? (
            <div className="loading">
              <div className="loading-spinner" />
              <p>Carregando palestrantes...</p>
            </div>
          ) : palestrantes.length > 0 ? (
            <div className="palestrantes-grid">
              {palestrantes.map(p => (
                <div key={p.id} className="palestrante-card">
                  <div className="palestrante-avatar">
                    {p.avatar ? (
                      <img src={p.avatar} alt={p.nome} />
                    ) : (
                      <div className="avatar-inicial">{inicialAvatar(p.nome)}</div>
                    )}
                  </div>
                  <h3>{p.nome}</h3>
                  {p.bio && (
                    <p className="palestrante-bio">
                      {p.bio.length > 100 ? p.bio.slice(0, 100) + '...' : p.bio}
                    </p>
                  )}
                  <span className="papel-badge">🎤 Palestrante</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <span>🎤</span>
              <p>Nenhum palestrante cadastrado ainda.</p>
              <Link to="/registrar" className="empty-cta">
                Quero ser palestrante
              </Link>
            </div>
          )}
        </section>

        {/* ── CONTATO ──────────────────────────────── */}
        <section id="contato" className="contato">
          <h2>Fale Conosco</h2>
          <p className="section-subtitle">Tem dúvidas? Entre em contato.</p>
          <form className="contato-form" onSubmit={e => e.preventDefault()}>
            <input type="text" placeholder="Seu nome" required />
            <input type="email" placeholder="Seu e-mail" required />
            <textarea placeholder="Sua mensagem" rows={5} required></textarea>
            <button type="submit">Enviar mensagem</button>
          </form>
        </section>

      </main>

      <footer className="footer">
        <div className="footer-inner">
          <div className="footer-brand">
            <h3>🎫 SysEvents</h3>
            <p>Sistema de Gestão de Eventos</p>
          </div>
          <div className="footer-links">
            <Link to="/login">Entrar</Link>
            <Link to="/registrar">Criar conta</Link>
            <a href="#contato">Contato</a>
          </div>
        </div>
        <p className="footer-copy">
          &copy; 2026 SysEvents — Desenvolvido para a disciplina de Desenvolvimento Web
        </p>
      </footer>
    </div>
  );
};

export default LandingPage;
